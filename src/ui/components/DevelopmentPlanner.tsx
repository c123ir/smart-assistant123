/**
 * @file DevelopmentPlanner.tsx
 * @description کامپوننت برنامه‌ریزی و مدیریت مراحل توسعه
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { DevelopmentPhase, DevelopmentTask } from '../../core/services/developmentService';
import './DevelopmentPlanner.scss';

// تعریف تایپ‌های مورد نیاز
interface Props {
  onPhaseCreate?: (phase: Omit<DevelopmentPhase, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onPhaseUpdate?: (id: string, phase: Partial<DevelopmentPhase>) => Promise<void>;
  onPhaseDelete?: (id: string) => Promise<void>;
  onTaskCreate?: (task: Omit<DevelopmentTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onTaskUpdate?: (id: string, task: Partial<DevelopmentTask>) => Promise<void>;
  onTaskDelete?: (id: string) => Promise<void>;
  onTaskComplete?: (id: string, isCompleted: boolean) => Promise<void>;
  onPhasesReorder?: (orderedIds: string[]) => Promise<void>;
  onTasksReorder?: (phaseId: string, orderedIds: string[]) => Promise<void>;
}

const DevelopmentPlanner: React.FC<Props> = ({
  onPhaseCreate,
  onPhaseUpdate,
  onPhaseDelete,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onTaskComplete,
  onPhasesReorder,
  onTasksReorder
}) => {
  // استیت‌های کامپوننت
  const [phases, setPhases] = useState<DevelopmentPhase[]>([]);
  const [tasks, setTasks] = useState<Record<string, DevelopmentTask[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [showNewPhaseForm, setShowNewPhaseForm] = useState<boolean>(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState<string | null>(null);

  // دریافت اطلاعات از سرور
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // @ts-ignore - دسترسی به API های الکترون از طریق window
      const developmentService = window.electron.getDevelopmentService();
      const loadedPhases = await developmentService.getPhases();
      setPhases(loadedPhases);

      // دریافت تسک‌های هر فاز
      const tasksMap: Record<string, DevelopmentTask[]> = {};
      for (const phase of loadedPhases) {
        const phaseTasks = await developmentService.getTasks(phase.id);
        tasksMap[phase.id] = phaseTasks;
      }
      setTasks(tasksMap);
    } catch (err) {
      setError('خطا در دریافت اطلاعات: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // مدیریت درگ و دراپ
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'PHASE') {
      // جابجایی فازها
      const newPhases = Array.from(phases);
      const [removed] = newPhases.splice(source.index, 1);
      newPhases.splice(destination.index, 0, removed);
      setPhases(newPhases);

      if (onPhasesReorder) {
        await onPhasesReorder(newPhases.map(p => p.id));
      }
    } else if (type === 'TASK') {
      const sourcePhaseId = source.droppableId;
      const destPhaseId = destination.droppableId;
      const newTasks = { ...tasks };

      if (sourcePhaseId === destPhaseId) {
        // جابجایی تسک‌ها در یک فاز
        const phaseTasks = Array.from(newTasks[sourcePhaseId]);
        const [removed] = phaseTasks.splice(source.index, 1);
        phaseTasks.splice(destination.index, 0, removed);
        newTasks[sourcePhaseId] = phaseTasks;

        if (onTasksReorder) {
          await onTasksReorder(sourcePhaseId, phaseTasks.map(t => t.id));
        }
      } else {
        // جابجایی تسک بین فازها
        const sourceTasks = Array.from(newTasks[sourcePhaseId]);
        const destTasks = Array.from(newTasks[destPhaseId]);
        const [removed] = sourceTasks.splice(source.index, 1);
        destTasks.splice(destination.index, 0, removed);

        newTasks[sourcePhaseId] = sourceTasks;
        newTasks[destPhaseId] = destTasks;

        if (onTaskUpdate) {
          await onTaskUpdate(removed.id, {
            phaseId: destPhaseId,
            orderIndex: destination.index
          });
        }

        if (onTasksReorder) {
          await Promise.all([
            onTasksReorder(sourcePhaseId, sourceTasks.map(t => t.id)),
            onTasksReorder(destPhaseId, destTasks.map(t => t.id))
          ]);
        }
      }

      setTasks(newTasks);
    }
  };

  // رندر فرم ایجاد فاز جدید
  const renderNewPhaseForm = () => {
    if (!showNewPhaseForm) return null;

    return (
      <div className="new-phase-form">
        <h3>ایجاد فاز جدید</h3>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          
          if (onPhaseCreate) {
            await onPhaseCreate({
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              icon: formData.get('icon') as string,
              color: formData.get('color') as string,
              orderIndex: phases.length
            });
          }

          setShowNewPhaseForm(false);
          await loadData();
        }}>
          <div className="form-group">
            <label>عنوان</label>
            <input type="text" name="title" required />
          </div>
          <div className="form-group">
            <label>توضیحات</label>
            <textarea name="description" />
          </div>
          <div className="form-group">
            <label>آیکون</label>
            <input type="text" name="icon" placeholder="نام آیکون" />
          </div>
          <div className="form-group">
            <label>رنگ</label>
            <input type="color" name="color" defaultValue="#4A90E2" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">ایجاد</button>
            <button type="button" className="btn-secondary" onClick={() => setShowNewPhaseForm(false)}>انصراف</button>
          </div>
        </form>
      </div>
    );
  };

  // رندر فرم ایجاد تسک جدید
  const renderNewTaskForm = (phaseId: string) => {
    if (showNewTaskForm !== phaseId) return null;

    return (
      <div className="new-task-form">
        <h4>تسک جدید</h4>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const formData = new FormData(form);
          
          if (onTaskCreate) {
            await onTaskCreate({
              phaseId,
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              isCompleted: false,
              orderIndex: (tasks[phaseId] || []).length,
              dueDate: formData.get('dueDate') ? new Date(formData.get('dueDate') as string).getTime() / 1000 : undefined
            });
          }

          setShowNewTaskForm(null);
          await loadData();
        }}>
          <div className="form-group">
            <label>عنوان</label>
            <input type="text" name="title" required />
          </div>
          <div className="form-group">
            <label>توضیحات</label>
            <textarea name="description" />
          </div>
          <div className="form-group">
            <label>تاریخ سررسید</label>
            <input type="date" name="dueDate" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">ایجاد</button>
            <button type="button" className="btn-secondary" onClick={() => setShowNewTaskForm(null)}>انصراف</button>
          </div>
        </form>
      </div>
    );
  };

  // رندر کارت فاز
  const renderPhaseCard = (phase: DevelopmentPhase, index: number) => {
    const phaseStyle = {
      backgroundColor: phase.color || '#4A90E2',
      borderColor: phase.color || '#4A90E2'
    };

    return (
      <Draggable key={phase.id} draggableId={phase.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="phase-card"
            style={phaseStyle}
          >
            <div className="phase-header" {...provided.dragHandleProps}>
              {phase.icon && <span className="phase-icon">{phase.icon}</span>}
              <h3 className="phase-title">{phase.title}</h3>
              <div className="phase-actions">
                <button onClick={() => setShowNewTaskForm(phase.id)} title="افزودن تسک">+</button>
                <button onClick={() => setEditingPhase(phase.id)} title="ویرایش فاز">✎</button>
                <button onClick={async () => {
                  if (window.confirm('آیا از حذف این فاز اطمینان دارید؟')) {
                    if (onPhaseDelete) {
                      await onPhaseDelete(phase.id);
                      await loadData();
                    }
                  }
                }} title="حذف فاز">×</button>
              </div>
            </div>
            
            <div className="phase-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${phase.completionPercentage || 0}%` }}
                />
              </div>
              <span className="progress-text">
                {phase.completionPercentage || 0}% تکمیل شده
                ({phase.tasksCount || 0} تسک)
              </span>
            </div>

            <Droppable droppableId={phase.id} type="TASK">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="tasks-container"
                >
                  {(tasks[phase.id] || []).map((task, taskIndex) => (
                    <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`task-card ${task.isCompleted ? 'completed' : ''}`}
                        >
                          <div className="task-header">
                            <input
                              type="checkbox"
                              checked={task.isCompleted}
                              onChange={async (e) => {
                                if (onTaskComplete) {
                                  await onTaskComplete(task.id, e.target.checked);
                                  await loadData();
                                }
                              }}
                            />
                            <h4>{task.title}</h4>
                            <div className="task-actions">
                              <button onClick={() => setEditingTask(task.id)} title="ویرایش تسک">✎</button>
                              <button onClick={async () => {
                                if (window.confirm('آیا از حذف این تسک اطمینان دارید؟')) {
                                  if (onTaskDelete) {
                                    await onTaskDelete(task.id);
                                    await loadData();
                                  }
                                }
                              }} title="حذف تسک">×</button>
                            </div>
                          </div>
                          {task.description && (
                            <p className="task-description">{task.description}</p>
                          )}
                          {task.dueDate && (
                            <div className="task-due-date">
                              تاریخ سررسید: {new Date(task.dueDate * 1000).toLocaleDateString('fa-IR')}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {renderNewTaskForm(phase.id)}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </Draggable>
    );
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="development-planner">
      <div className="planner-header">
        <h2>برنامه‌ریزی توسعه</h2>
        <button className="btn-primary" onClick={() => setShowNewPhaseForm(true)}>
          ایجاد فاز جدید
        </button>
      </div>

      {renderNewPhaseForm()}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="phases" type="PHASE" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="phases-container"
            >
              {phases.map((phase, index) => renderPhaseCard(phase, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DevelopmentPlanner; 
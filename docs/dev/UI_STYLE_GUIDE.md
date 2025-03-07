# راهنمای استایل و طراحی رابط کاربری برنامه

این سند قوانین و استانداردهای طراحی رابط کاربری برنامه دستیار هوشمند را توضیح می‌دهد. این قوانین باید توسط تمامی اعضای تیم توسعه رعایت شود تا یکپارچگی و کیفیت طراحی حفظ گردد.

## اصول کلی طراحی

1. **سادگی**: رابط کاربری باید ساده و بدون پیچیدگی غیرضروری باشد.
2. **انسجام**: تمامی المان‌ها باید از سبک و استانداردهای یکسان پیروی کنند.
3. **پاسخگویی**: تمامی صفحات و کامپوننت‌ها باید در تمامی سایزهای صفحه نمایش به درستی نمایش داده شوند.
4. **دسترسی‌پذیری**: طراحی باید برای کاربران با نیازهای مختلف قابل استفاده باشد.
5. **زیبایی**: رابط کاربری باید از نظر بصری جذاب و زیبا باشد.

## سیستم رنگ

### پالت رنگی اصلی

ما از یک سیستم رنگ متغیر استفاده می‌کنیم که از طریق CSS Variables پیاده‌سازی شده‌است:

```css
--primary-color: #3182ce;
--primary-color-dark: #2c5282;
--primary-color-light: #bee3f8;

--accent-color: #6b46c1;
--accent-color-dark: #553c9a;
--accent-color-light: #d6bcfa;
```

### رنگ‌های وضعیت

برای نمایش وضعیت‌های مختلف از رنگ‌های زیر استفاده می‌کنیم:

```css
--error-color: #e53e3e;
--warning-color: #ed8936;
--success-color: #38a169;
--info-color: #3182ce;
```

### رنگ‌های متنوع برای کارت‌ها

برای ایجاد تنوع بصری در کارت‌ها از پالت رنگی زیر استفاده می‌کنیم:

```css
--card-1-bg: #ebf8ff;
--card-1-accent: #4299e1;

--card-2-bg: #e6fffa;
--card-2-accent: #38b2ac;

--card-3-bg: #faf5ff;
--card-3-accent: #805ad5;

--card-4-bg: #fff5f5;
--card-4-accent: #f56565;

--card-5-bg: #fffaf0;
--card-5-accent: #ed8936;
```

## تم روشن و تاریک

برنامه باید از هر دو تم روشن و تاریک پشتیبانی کند. تمامی کامپوننت‌ها باید با هر دو تم سازگار باشند.

```css
/* تم روشن (پیش‌فرض) */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  /* ... */
}

/* تم تاریک */
[data-theme="dark"] {
  --bg-color: #121212;
  --text-color: rgba(255, 255, 255, 0.9);
  /* ... */
}
```

## تایپوگرافی

ما از فونت فارسی وزیرمتن به عنوان فونت اصلی برنامه استفاده می‌کنیم:

```css
--font-family: 'Vazirmatn', 'Tahoma', sans-serif;
```

### اندازه‌های فونت

```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-md: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
```

## آیکون‌ها

### استایل آیکون‌ها

تمامی آیکون‌های برنامه باید از استایل "فلت" پیروی کنند و دارای خصوصیات زیر باشند:

```css
svg.icon {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
```

### اندازه آیکون‌ها

```css
--icon-size: 20px;
--icon-size-small: 16px;
--icon-size-large: 24px;
--icon-sidebar-size: 22px;
```

## کامپوننت‌ها

### کارت‌ها

کارت‌ها باید از استایل زیر پیروی کنند:

- گوشه‌های گرد (`border-radius: 8px`)
- سایه (`box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05)`)
- انیمیشن هاور (`transform: translateY(-2px)`)
- رنگ‌بندی متناسب با نوع محتوا

#### کارت‌های کاربران

کارت‌های کاربران باید از مشخصات زیر پیروی کنند:

- دقیقاً ۲ کارت در هر سطر (`grid-template-columns: repeat(2, 1fr)`)
- اندازه متناسب و کوچک
- فاصله مناسب بین کارت‌ها (`gap: 1rem`)
- پدینگ کمتر (`padding: 0.75rem`)
- رنگ‌بندی بر اساس نقش کاربر

نمونه رنگ‌بندی بر اساس نقش کاربر:
- **مدیر سیستم**: زمینه کمرنگ قرمز با نوار کناری قرمز
- **مدیر**: زمینه کمرنگ آبی با نوار کناری آبی
- **توسعه‌دهنده**: زمینه کمرنگ سبز با نوار کناری سبز
- **بازدیدکننده**: زمینه کمرنگ نارنجی با نوار کناری نارنجی

اندازه المان‌های داخلی:
- آواتار: `35px × 35px`
- فونت نام کاربر: `0.95rem`
- فونت نام کاربری: `0.8rem`
- فونت ایمیل: `0.85rem`
- آیکون‌ها: `12px × 12px`
- دکمه‌ها: `padding: 0.25rem 0.5rem`

### دکمه‌ها

دکمه‌ها باید از انواع زیر پیروی کنند:

- **اصلی** (`primary`): برای اکشن‌های اصلی
- **ثانویه** (`secondary`): برای اکشن‌های ثانویه
- **خطرناک** (`danger`): برای اکشن‌های خطرناک
- **کم‌رنگ** (`outline`): برای اکشن‌های کم‌اهمیت
- **متنی** (`text`): برای اکشن‌های جانبی

### فرم‌ها

فرم‌ها باید از قوانین زیر پیروی کنند:

- استفاده از برچسب (`label`) برای هر فیلد
- نمایش پیام خطا زیر هر فیلد در صورت نیاز
- استفاده از کلاس `has-error` برای فیلدهای دارای خطا
- سازگاری با حالت‌های روشن و تاریک

## رسپانسیو بودن

تمامی المان‌ها و صفحات باید در سایزهای مختلف صفحه نمایش به درستی نمایش داده شوند. از media query برای این منظور استفاده کنید:

```css
/* دسکتاپ (پیش‌فرض) */
.element {
  /* ... */
}

/* تبلت */
@media (max-width: 768px) {
  .element {
    /* ... */
  }
}

/* موبایل */
@media (max-width: 576px) {
  .element {
    /* ... */
  }
}
```

برای کارت‌های کاربران:
```css
/* دسکتاپ (پیش‌فرض): ۲ کارت در هر سطر */
.user-list {
  grid-template-columns: repeat(2, 1fr);
}

/* موبایل: ۱ کارت در هر سطر */
@media (max-width: 768px) {
  .user-list {
    grid-template-columns: 1fr;
  }
}
```

## انیمیشن‌ها

انیمیشن‌ها باید ظریف و کاربردی باشند و فقط در مواردی که به تجربه کاربری کمک می‌کنند استفاده شوند:

```css
--transition-fast: 150ms ease-in-out;
--transition-normal: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;
```

## نکات مهم برای توسعه‌دهندگان

1. همیشه از متغیرهای CSS استفاده کنید، نه مقادیر هارد‌کد شده
2. تمامی کامپوننت‌ها باید با هر دو تم روشن و تاریک سازگار باشند
3. همیشه رسپانسیو بودن را در نظر بگیرید
4. از SVG برای آیکون‌ها استفاده کنید، نه از فونت آیکون
5. برای استایل‌دهی از SCSS استفاده کنید
6. برای چیدمان از Flexbox یا Grid استفاده کنید
7. از کلاس‌های کمکی موجود در `global.scss` استفاده کنید
8. برای کارت‌های کاربران، دقیقاً ۲ کارت در هر سطر نمایش دهید
9. اندازه کارت‌ها را متناسب و کوچک نگه دارید

## مثال‌های کد

### کارت کاربر

```tsx
<div className={`user-item role-${user.role}`}>
  <div className="user-info">
    <div className="user-avatar">
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name} />
      ) : (
        <div className="no-avatar">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
    <div className="user-details">
      <div className="user-name">{user.full_name}</div>
      <div className="user-username">@{user.username}</div>
      {user.phone_number && (
        <div className="user-phone">{user.phone_number}</div>
      )}
    </div>
  </div>
  <div className="user-email">{user.email}</div>
  <div className="user-role">
    <span className={`role-badge ${getRoleClass(user.role)}`}>
      {getRoleName(user.role)}
    </span>
  </div>
  <div className="user-actions">
    <button
      className="button secondary small"
      onClick={() => handleEditUser(user)}
    >
      <svg className="icon">...</svg>
      ویرایش
    </button>
    <button
      className="button danger small"
      onClick={() => handleDeleteClick(user)}
    >
      <svg className="icon">...</svg>
      حذف
    </button>
  </div>
</div>
```

### استایل کارت کاربران

```scss
.user-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr); // دقیقاً ۲ کارت در هر سطر
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; // یک کارت در هر سطر برای نمایشگرهای کوچک
  }

  .user-item {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
    position: relative;
    overflow: hidden;
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    font-size: 0.875rem;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    
    // رنگ‌بندی بر اساس نقش کاربر
    &.role-admin {
      background-color: var(--card-1-bg, #fff5f5);
      border-left: 3px solid var(--card-1-accent, var(--error-color));
    }
  }
}
```

### فرم‌ها

```tsx
<div className={`form-group ${formErrors.username ? 'has-error' : ''}`}>
  <label htmlFor="username">نام کاربری:</label>
  <input
    type="text"
    id="username"
    name="username"
    value={formData.username}
    onChange={handleChange}
    placeholder="نام کاربری را وارد کنید..."
  />
  {formErrors.username && <div className="error-text">{formErrors.username}</div>}
</div>
```

## نتیجه‌گیری

پیروی از این راهنمای استایل به ما کمک می‌کند که یک رابط کاربری منسجم، زیبا و کاربرپسند ایجاد کنیم. همیشه به خاطر داشته باشید که خوانایی، سادگی و تجربه کاربری را در اولویت قرار دهید. 
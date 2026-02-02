# Utility Functions Reference

## Overview

The utility functions provide common helper methods used throughout the application for string manipulation, date formatting, ID generation, and other common operations.

## StringUtils.gs

**Purpose**: String manipulation and generation utilities.

**Location**: [Utils/StringUtils.gs](../Utils/StringUtils.gs)

### Functions Reference

#### `generateUUID()`

Generates a unique identifier using UUID v4 format.

**Returns**: String (UUID format)

**Example**:
```javascript
const userId = generateUUID();
// Returns: "123e4567-e89b-12d3-a456-426614174000"
```

**Implementation**:
```javascript
function generateUUID() {
    const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return template.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
```

---

#### `generateCode(prefix, number, padding = 3)`

Generates a formatted code with prefix and zero-padded number.

**Parameters**:
- `prefix` (String): Code prefix (e.g., "DIR")
- `number` (Integer): Number to append
- `padding` (Integer): Zero padding length (default: 3)

**Returns**: String

**Examples**:
```javascript
generateCode('DIR', 1);        // Returns: "DIR-001"
generateCode('WU', 15);        // Returns: "WU-015"
generateCode('POS', 999, 4);   // Returns: "POS-0999"
```

**Implementation**:
```javascript
function generateCode(prefix, number, padding = 3) {
    const padded = String(number).padStart(padding, '0');
    return `${prefix}-${padded}`;
}
```

---

#### `parseCodeNumber(code, separator = '-')`

Extracts the numeric portion from a generated code.

**Parameters**:
- `code` (String): Code string (e.g., "DIR-001")
- `separator` (String): Separator character (default: "-")

**Returns**: Integer

**Examples**:
```javascript
parseCodeNumber('DIR-001');    // Returns: 1
parseCodeNumber('WU-015');     // Returns: 15
parseCodeNumber('POS-123');    // Returns: 123
```

---

#### `slugify(text)`

Converts text to URL-safe slug format.

**Parameters**:
- `text` (String): Text to slugify

**Returns**: String

**Examples**:
```javascript
slugify('Hello World');           // Returns: "hello-world"
slugify('Directorate of Finance'); // Returns: "directorate-of-finance"
slugify('KPI - Target 2024');     // Returns: "kpi-target-2024"
```

**Implementation**:
```javascript
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}
```

---

#### `truncate(text, length = 100, suffix = '...')`

Truncates text to specified length and adds suffix.

**Parameters**:
- `text` (String): Text to truncate
- `length` (Integer): Max length before truncation
- `suffix` (String): Suffix to add (default: "...")

**Returns**: String

**Examples**:
```javascript
truncate('This is a very long text that needs to be truncated', 20);
// Returns: "This is a very lo..."

truncate('Short text', 20, '...');
// Returns: "Short text" (no truncation needed)
```

**Implementation**:
```javascript
function truncate(text, length = 100, suffix = '...') {
    if (!text || text.length <= length) return text;
    return text.substring(0, length - suffix.length) + suffix;
}
```

---

#### `capitalize(text)`

Capitalizes the first letter of text.

**Parameters**:
- `text` (String): Text to capitalize

**Returns**: String

**Examples**:
```javascript
capitalize('hello world');  // Returns: "Hello world"
capitalize('USER');         // Returns: "USER"
capitalize('');             // Returns: ""
```

---

#### `capitalizeWords(text)`

Capitalizes the first letter of each word.

**Parameters**:
- `text` (String): Text to capitalize

**Returns**: String

**Examples**:
```javascript
capitalizeWords('hello world');  // Returns: "Hello World"
capitalizeWords('john doe');     // Returns: "John Doe"
```

**Implementation**:
```javascript
function capitalizeWords(text) {
    return text.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}
```

---

#### `isNullOrEmpty(value)`

Checks if value is null, undefined, or empty string.

**Parameters**:
- `value` (Any): Value to check

**Returns**: Boolean

**Examples**:
```javascript
isNullOrEmpty(null);        // Returns: true
isNullOrEmpty('');          // Returns: true
isNullOrEmpty('   ');       // Returns: true (after trim)
isNullOrEmpty('text');      // Returns: false
isNullOrEmpty(0);           // Returns: false (number)
```

**Implementation**:
```javascript
function isNullOrEmpty(value) {
    return value === null || value === undefined ||
           (typeof value === 'string' && value.trim() === '');
}
```

---

#### `sanitizeInput(text)`

Removes potentially dangerous characters from user input.

**Parameters**:
- `text` (String): Text to sanitize

**Returns**: String

**Examples**:
```javascript
sanitizeInput('<script>alert("xss")</script>');
// Returns: "scriptalert(xss)/script"

sanitizeInput('Hello "World"');
// Returns: 'Hello "World"'
```

**Implementation**:
```javascript
function sanitizeInput(text) {
    if (!text) return '';
    return text
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
}
```

---

#### `formatBytes(bytes, decimals = 2)`

Formats bytes into human-readable format.

**Parameters**:
- `bytes` (Number): Number of bytes
- `decimals` (Integer): Decimal places (default: 2)

**Returns**: String

**Examples**:
```javascript
formatBytes(1024);           // Returns: "1 KB"
formatBytes(1048576);        // Returns: "1 MB"
formatBytes(1073741824);     // Returns: "1 GB"
formatBytes(1500);           // Returns: "1.46 KB"
```

**Implementation**:
```javascript
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
```

---

#### `generateRandomString(length = 10)`

Generates a random alphanumeric string.

**Parameters**:
- `length` (Integer): String length (default: 10)

**Returns**: String

**Examples**:
```javascript
generateRandomString();      // Returns: "aB3xY9zK2m"
generateRandomString(20);    // Returns: "xY9zK2mP4qR7sT1uV3w"
```

**Implementation**:
```javascript
function generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
```

---

#### `extractInitials(fullName)`

Extracts initials from full name.

**Parameters**:
- `fullName` (String): Full name

**Returns**: String

**Examples**:
```javascript
extractInitials('John Doe');       // Returns: "JD"
extractInitials('Mary Jane Smith'); // Returns: "MJS"
extractInitials('John');           // Returns: "J"
```

**Implementation**:
```javascript
function extractInitials(fullName) {
    if (!fullName) return '';
    return fullName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2); // Max 2 initials
}
```

---

## DateUtils.gs

**Purpose**: Date manipulation and formatting utilities.

**Location**: [Utils/DateUtils.gs](../Utils/DateUtils.gs)

### Functions Reference

#### `formatDateISO(date)`

Formats date as ISO date string (YYYY-MM-DD).

**Parameters**:
- `date` (Date): Date object

**Returns**: String

**Examples**:
```javascript
formatDateISO(new Date(2026, 1, 3));
// Returns: "2026-02-03"

formatDateISO(new Date());
// Returns: "2026-02-03" (current date)
```

**Implementation**:
```javascript
function formatDateISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
```

---

#### `formatDateTime(date)`

Formats date as datetime string (YYYY-MM-DD HH:mm:ss).

**Parameters**:
- `date` (Date): Date object

**Returns**: String

**Examples**:
```javascript
formatDateTime(new Date(2026, 1, 3, 14, 30, 45));
// Returns: "2026-02-03 14:30:45"
```

**Implementation**:
```javascript
function formatDateTime(date) {
    const datePart = formatDateISO(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${datePart} ${hours}:${minutes}:${seconds}`;
}
```

---

#### `parseDate(dateString)`

Parses date string into Date object.

**Parameters**:
- `dateString` (String): Date string (ISO format or various formats)

**Returns**: Date object

**Examples**:
```javascript
parseDate('2026-02-03');
// Returns: Date object for Feb 3, 2026

parseDate('03/02/2026');
// Returns: Date object (depends on locale)

parseDate('Feb 3, 2026');
// Returns: Date object
```

**Implementation**:
```javascript
function parseDate(dateString) {
    if (!dateString) return null;

    // Try ISO format first
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }

    // Fallback to Date constructor
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
}
```

---

#### `parseDateTime(dateTimeString)`

Parses datetime string into Date object.

**Parameters**:
- `dateTimeString` (String): Datetime string

**Returns**: Date object

**Examples**:
```javascript
parseDateTime('2026-02-03 14:30:45');
// Returns: Date object for Feb 3, 2026 at 14:30:45
```

---

#### `getWeekNumber(date)`

Gets ISO week number of the year.

**Parameters**:
- `date` (Date): Date object

**Returns**: Integer (1-53)

**Examples**:
```javascript
getWeekNumber(new Date(2026, 0, 1));   // Jan 1, 2026
// Returns: 1

getWeekNumber(new Date(2026, 1, 3));   // Feb 3, 2026
// Returns: 5
```

**Implementation**:
```javascript
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
```

---

#### `getWeekStart(date)`

Gets the Monday (start) of the week for a given date.

**Parameters**:
- `date` (Date): Date object

**Returns**: Date object

**Examples**:
```javascript
getWeekStart(new Date(2026, 1, 3));  // Feb 3, 2026 (Tuesday)
// Returns: Feb 2, 2026 (Monday)
```

**Implementation**:
```javascript
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(d.setDate(diff));
}
```

---

#### `getWeekEnd(date)`

Gets the Sunday (end) of the week for a given date.

**Parameters**:
- `date` (Date): Date object

**Returns**: Date object

**Examples**:
```javascript
getWeekEnd(new Date(2026, 1, 3));  // Feb 3, 2026 (Tuesday)
// Returns: Feb 8, 2026 (Sunday)
```

**Implementation**:
```javascript
function getWeekEnd(date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Add 6 days to get Sunday
    return end;
}
```

---

#### `getQuarterFromMonth(month)`

Gets quarter number from month (0-11).

**Parameters**:
- `month` (Integer): Month number (0 = January, 11 = December)

**Returns**: Integer (1-4)

**Examples**:
```javascript
getQuarterFromMonth(0);   // January
// Returns: 1

getQuarterFromMonth(3);   // April
// Returns: 2

getQuarterFromMonth(11);  // December
// Returns: 4
```

**Implementation**:
```javascript
function getQuarterFromMonth(month) {
    return Math.floor(month / 3) + 1;
}
```

---

#### `addDays(date, days)`

Adds days to a date.

**Parameters**:
- `date` (Date): Original date
- `days` (Integer): Number of days to add (can be negative)

**Returns**: Date object

**Examples**:
```javascript
addDays(new Date('2026-02-03'), 7);
// Returns: Feb 10, 2026

addDays(new Date('2026-02-03'), -7);
// Returns: Jan 27, 2026
```

**Implementation**:
```javascript
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
```

---

#### `addMonths(date, months)`

Adds months to a date.

**Parameters**:
- `date` (Date): Original date
- `months` (Integer): Number of months to add (can be negative)

**Returns**: Date object

**Examples**:
```javascript
addMonths(new Date('2026-02-03'), 1);
// Returns: Mar 3, 2026

addMonths(new Date('2026-02-03'), 12);
// Returns: Feb 3, 2027
```

---

#### `diffDays(date1, date2)`

Calculates difference in days between two dates.

**Parameters**:
- `date1` (Date): First date
- `date2` (Date): Second date

**Returns**: Integer (number of days)

**Examples**:
```javascript
diffDays(new Date('2026-02-10'), new Date('2026-02-03'));
// Returns: 7

diffDays(new Date('2026-02-03'), new Date('2026-02-10'));
// Returns: -7
```

**Implementation**:
```javascript
function diffDays(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date1 - date2) / oneDay);
}
```

---

#### `diffWeeks(date1, date2)`

Calculates difference in weeks between two dates.

**Parameters**:
- `date1` (Date): First date
- `date2` (Date): Second date

**Returns**: Integer (number of weeks)

**Examples**:
```javascript
diffWeeks(new Date('2026-02-17'), new Date('2026-02-03'));
// Returns: 2
```

---

#### `diffMonths(date1, date2)`

Calculates difference in months between two dates.

**Parameters**:
- `date1` (Date): First date
- `date2` (Date): Second date

**Returns**: Integer (number of months)

**Examples**:
```javascript
diffMonths(new Date('2026-03-03'), new Date('2026-02-03'));
// Returns: 1

diffMonths(new Date('2026-02-03'), new Date('2026-03-03'));
// Returns: -1
```

**Implementation**:
```javascript
function diffMonths(date1, date2) {
    const months1 = date1.getFullYear() * 12 + date1.getMonth();
    const months2 = date2.getFullYear() * 12 + date2.getMonth();
    return months1 - months2;
}
```

---

#### `isToday(date)`

Checks if date is today.

**Parameters**:
- `date` (Date): Date to check

**Returns**: Boolean

**Examples**:
```javascript
isToday(new Date());  // Returns: true (if run today)
isToday(new Date('2026-01-01'));  // Returns: false (unless today is Jan 1, 2026)
```

**Implementation**:
```javascript
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}
```

---

#### `isFuture(date)`

Checks if date is in the future.

**Parameters**:
- `date` (Date): Date to check

**Returns**: Boolean

**Examples**:
```javascript
isFuture(new Date('2030-01-01'));  // Returns: true
isFuture(new Date('2020-01-01'));  // Returns: false
```

---

#### `isPast(date)`

Checks if date is in the past.

**Parameters**:
- `date` (Date): Date to check

**Returns**: Boolean

**Examples**:
```javascript
isPast(new Date('2020-01-01'));  // Returns: true
isPast(new Date('2030-01-01'));  // Returns: false
```

---

#### `getAge(birthDate)`

Calculates age from birth date.

**Parameters**:
- `birthDate` (Date): Birth date

**Returns**: Integer (age in years)

**Examples**:
```javascript
getAge(new Date('1990-06-15'));
// Returns: 35 (if current year is 2026 and birthday hasn't passed)
// Returns: 36 (if birthday has passed in 2026)
```

**Implementation**:
```javascript
function getAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}
```

---

#### `formatDateRelative(date)`

Formats date as relative time (e.g., "2 days ago").

**Parameters**:
- `date` (Date): Date to format

**Returns**: String

**Examples**:
```javascript
formatDateRelative(new Date());  // Returns: "just now"
formatDateRelative(addDays(new Date(), -2));  // Returns: "2 days ago"
formatDateRelative(addDays(new Date(), -30)); // Returns: "1 month ago"
```

**Implementation**:
```javascript
function formatDateRelative(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}
```

---

#### `getMonthName(month, format = 'long')`

Gets month name from month number.

**Parameters**:
- `month` (Integer): Month number (0-11)
- `format` (String): 'long' or 'short' (default: 'long')

**Returns**: String

**Examples**:
```javascript
getMonthName(0);      // Returns: "January"
getMonthName(5);      // Returns: "June"
getMonthName(11);     // Returns: "December"
getMonthName(0, 'short');  // Returns: "Jan"
```

---

#### `getDayName(day, format = 'long')`

Gets day name from day number.

**Parameters**:
- `day` (Integer): Day number (0-6, 0 = Sunday)
- `format` (String): 'long' or 'short' (default: 'long')

**Returns**: String

**Examples**:
```javascript
getDayName(0);       // Returns: "Sunday"
getDayName(1);       // Returns: "Monday"
getDayName(6);       // Returns: "Saturday"
getDayName(1, 'short');  // Returns: "Mon"
```

---

#### `formatDuration(seconds)`

Formats seconds into human-readable duration.

**Parameters**:
- `seconds` (Number): Number of seconds

**Returns**: String

**Examples**:
```javascript
formatDuration(45);        // Returns: "45s"
formatDuration(90);        // Returns: "1m 30s"
formatDuration(3661);      // Returns: "1h 1m 1s"
formatDuration(90061);     // Returns: "25h 1m 1s"
```

**Implementation**:
```javascript
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
}
```

---

## Usage Examples

### Combining String and Date Utilities

```javascript
// Generate a unique code for a new directorate
const directorateCount = getAllDirectorates().length;
const directorateCode = generateCode('DIR', directorateCount + 1);
// Returns: "DIR-005" (if this is the 5th directorate)

// Format a date for display
const createdDate = new Date();
const formattedDate = formatDateISO(createdDate);
// Returns: "2026-02-03"

// Calculate week context for OKR
const today = new Date();
const weekNumber = getWeekNumber(today);
const quarter = getQuarterFromMonth(today.getMonth());
const weekStart = formatDateISO(getWeekStart(today));
const weekEnd = formatDateISO(getWeekEnd(today));

console.log(`Week ${weekNumber} of Q${quarter}: ${weekStart} to ${weekEnd}`);
// Output: "Week 5 of Q1: 2026-02-02 to 2026-02-08"
```

### Validation Examples

```javascript
// Validate and format user input
function processUserInput(name, dateString) {
    // Capitalize name
    const formattedName = capitalizeWords(name.trim());

    // Parse and validate date
    const date = parseDate(dateString);
    if (!date) {
        return { error: 'Invalid date format' };
    }

    // Format date for storage
    const isoDate = formatDateISO(date);

    return {
        name: formattedName,
        date: isoDate
    };
}

// Example
const result = processUserInput('john doe', '03/02/2026');
// Returns: { name: 'John Doe', date: '2026-02-03' }
```

## Performance Considerations

1. **Date Parsing**: Use `parseDate()` instead of multiple `new Date()` calls with different formats
2. **String Operations**: Cache repeated string operations when possible
3. **UUID Generation**: Generate UUIDs only when needed, not in loops
4. **Date Comparisons**: Use timestamps for comparisons instead of full date objects

## Testing

```javascript
// Test StringUtils
function testStringUtils() {
    console.log(generateUUID());                    // Should output UUID
    console.log(generateCode('DIR', 1));            // Should output "DIR-001"
    console.log(slugify('Hello World'));            // Should output "hello-world"
    console.log(truncate('Very long text...', 10)); // Should truncate
}

// Test DateUtils
function testDateUtils() {
    const date = new Date(2026, 1, 3);
    console.log(formatDateISO(date));               // Should output "2026-02-03"
    console.log(getWeekNumber(date));               // Should output week number
    console.log(getWeekStart(date));                // Should output Monday of that week
    console.log(diffDays(addDays(date, 7), date)); // Should output 7
}
```

## Next Steps

- See [StringUtils.gs](../Utils/StringUtils.gs) for implementation
- See [DateUtils.gs](../Utils/DateUtils.gs) for implementation
- See [Patterns & Conventions](./31-patterns-conventions.md) for usage patterns

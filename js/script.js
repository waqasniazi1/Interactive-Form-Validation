// ---------- Element references ----------
const form = document.getElementById('regForm');
const submitBtn = document.getElementById('submitBtn');
const successBanner = document.getElementById('successBanner');
const strengthBars = document.querySelectorAll('.strength span');
const termsCheckbox = document.getElementById('terms');
const termsMsg = document.getElementById('termsMsg');

// Simulated "already taken" usernames (extra feature, not in original requirements)
const takenUsernames = ['admin', 'test', 'softgrowtech', 'intern'];

// ---------- Field definitions ----------
const fields = {
  name: {
    input: document.getElementById('name'),
    field: document.getElementById('nameField'),
    msg: document.getElementById('nameMsg'),
    validate(v) {
      if (!v.trim()) return 'Name is required.';
      if (v.trim().length < 3) return 'Enter at least 3 characters.';
      if (!/^[A-Za-z\s]+$/.test(v.trim())) return 'Letters and spaces only.';
      return '';
    }
  },
  username: {
    input: document.getElementById('username'),
    field: document.getElementById('usernameField'),
    msg: document.getElementById('usernameMsg'),
    validate(v) {
      if (!v.trim()) return 'Username is required.';
      if (!/^[a-zA-Z0-9_]{4,16}$/.test(v.trim())) return '4-16 chars: letters, numbers, underscore.';
      if (takenUsernames.includes(v.trim().toLowerCase())) return 'This username is already taken.';
      return '';
    }
  },
  email: {
    input: document.getElementById('email'),
    field: document.getElementById('emailField'),
    msg: document.getElementById('emailMsg'),
    validate(v) {
      if (!v.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.';
      return '';
    }
  },
  phone: {
    input: document.getElementById('phone'),
    field: document.getElementById('phoneField'),
    msg: document.getElementById('phoneMsg'),
    validate(v) {
      if (!v.trim()) return 'Phone number is required.';
      if (!/^03\d{9}$/.test(v.trim())) return 'Enter a valid Pakistani number (e.g. 03XXXXXXXXX, 11 digits).';
      return '';
    }
  },
  dob: {
    input: document.getElementById('dob'),
    field: document.getElementById('dobField'),
    msg: document.getElementById('dobMsg'),
    validate(v) {
      if (!v) return 'Date of birth is required.';
      const dob = new Date(v);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (dob > today) return 'Date cannot be in the future.';
      if (age < 13) return 'You must be at least 13 years old.';
      return '';
    }
  },
  password: {
    input: document.getElementById('password'),
    field: document.getElementById('passwordField'),
    msg: document.getElementById('passwordMsg'),
    validate(v) {
      if (!v) return 'Password is required.';
      if (v.length < 8) return 'Use at least 8 characters.';
      if (!/[A-Z]/.test(v)) return 'Add at least one uppercase letter.';
      if (!/[0-9]/.test(v)) return 'Add at least one number.';
      if (!/[^A-Za-z0-9]/.test(v)) return 'Add at least one symbol.';
      return '';
    }
  },
  confirm: {
    input: document.getElementById('confirm'),
    field: document.getElementById('confirmField'),
    msg: document.getElementById('confirmMsg'),
    validate(v) {
      if (!v) return 'Please confirm your password.';
      if (v !== fields.password.input.value) return 'Passwords do not match.';
      return '';
    }
  }
};

// ---------- Password strength meter ----------
function updateStrength(v) {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const colors = ['#B5583A', '#B5583A', '#C9A227', '#3F7A5A'];
  strengthBars.forEach((bar, i) => {
    bar.style.background = i < score ? colors[score - 1] : '#D8D2C2';
  });
}

// ---------- Validate a single field, update UI ----------
function validateOne(key) {
  const f = fields[key];
  const error = f.validate(f.input.value);
  f.field.classList.remove('valid', 'invalid');

  if (f.input.value === '') {
    f.msg.textContent = '';
  } else if (error) {
    f.field.classList.add('invalid');
    f.msg.textContent = error;
  } else {
    f.field.classList.add('valid');
    f.msg.textContent = '✓ Looks good';
  }
  return !error && f.input.value !== '';
}

function validateTerms() {
  if (!termsCheckbox.checked) {
    termsMsg.textContent = 'You must accept the terms to continue.';
    return false;
  }
  termsMsg.textContent = '';
  return true;
}

function checkAll() {
  const fieldResults = Object.keys(fields).map(validateOne);
  const termsOk = validateTerms();
  const allValid = fieldResults.every(Boolean) && termsOk;
  submitBtn.disabled = !allValid;
  return allValid;
}

// ---------- Debounce helper (used for username "availability" check) ----------
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
const debouncedUsernameCheck = debounce(() => {
  validateOne('username');
  checkAll();
}, 300);

// ---------- Wire up events ----------
Object.keys(fields).forEach(key => {
  fields[key].input.addEventListener('input', () => {
    if (key === 'password') {
      updateStrength(fields.password.input.value);
      validateOne('confirm');
    }
    if (key === 'username') {
      debouncedUsernameCheck();
      return;
    }
    checkAll();
  });
});

termsCheckbox.addEventListener('change', checkAll);

// ---------- Submit ----------
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!checkAll()) return;

  successBanner.classList.add('show');
  this.reset();

  Object.keys(fields).forEach(key => {
    fields[key].field.classList.remove('valid', 'invalid');
    fields[key].msg.textContent = '';
  });
  strengthBars.forEach(bar => (bar.style.background = '#D8D2C2'));
  termsMsg.textContent = '';
  submitBtn.disabled = true;

  setTimeout(() => successBanner.classList.remove('show'), 4000);
});

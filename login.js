// ============ EmailJS Config ============
// حطي هنا القيم بتاعتك من حساب EmailJS
const EMAILJS_PUBLIC_KEY = 'k06GRENMUhzdUj0W2';
const EMAILJS_SERVICE_ID = 'service_sllenba';
const EMAILJS_TEMPLATE_ID = 'template_l5gg40q';

emailjs.init(EMAILJS_PUBLIC_KEY);

// ============ دوال التبديل بين اللوجين والسيجن أب ============
function showSignup() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('signupSection').style.display = 'block';
}

function showLogin() {
  document.getElementById('signupSection').style.display = 'none';
  document.getElementById('forgotSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
}

function showForgot() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('forgotSection').style.display = 'block';
}

// ============ القايمة المنسدلة (تشتغل بس بعد تسجيل الدخول بنجاح) ============
let isLoggedIn = false;

function toggleMenu() {
  if (!isLoggedIn) return; // منع فتح القايمة قبل تسجيل الدخول

  const menuList = document.getElementById('menuList');
  const arrow = document.getElementById('menuArrow');
  const isOpen = menuList.style.display === 'flex';

  menuList.style.display = isOpen ? 'none' : 'flex';
  arrow.textContent = isOpen ? '▾' : '▴';
}

function unlockMenu(username) {
  // نسجل حالة الدخول عشان لو دخل على index.html من قايمة الكاتيجوريز يشتغل صح
  localStorage.setItem('loggedIn', 'true');
  localStorage.setItem('currentUsername', username || 'Guest');

  isLoggedIn = true;
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('signupSection').style.display = 'none';
  document.getElementById('menuSection').style.display = 'block';

  // نفتح القايمة مباشرة من غير ما ننتظر دوسة على اللوجو
  document.getElementById('menuArrow').style.display = 'inline';
  document.getElementById('menuArrow').textContent = '▴';
  document.getElementById('menuList').style.display = 'flex';
}

// ============ دوال مساعدة ============
function showMessage(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'message ' + type;
  el.style.display = 'block';
}

function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// ============ Sign Up ============
document.getElementById('signupForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;

  if (password !== confirm) {
    showMessage('signupMessage', 'Passwords do not match', 'error');
    return;
  }

  const users = getUsers();

  if (users.find(u => u.email === email)) {
    showMessage('signupMessage', 'This email is already registered', 'error');
    return;
  }

  users.push({ username, email, password });
  saveUsers(users);

  document.getElementById('signupForm').reset();

  // نرجع لصفحة اللوجين، ونحط الإيميل جاهز، ونظهر رسالة نجاح
  showLogin();
  document.getElementById('email').value = email;
  showMessage('loginMessage', 'Account created successfully! You can log in now.', 'success');
});

// ============ Login ============
document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const identifier = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const button = event.currentTarget.querySelector('button[type="submit"]');

  button.textContent = 'جاري تسجيل الدخول...';

  setTimeout(() => {
    const users = getUsers();
    const user = users.find(u =>
      (u.email === identifier || u.username === identifier) && u.password === password
    );

    if (!user) {
      button.textContent = 'Log In';
      showMessage('loginMessage', 'Incorrect email or password', 'error');
      return;
    }

    button.textContent = 'تم تسجيل الدخول ✓';
    showMessage('loginMessage', 'Welcome back, ' + user.username + '!', 'success');

    setTimeout(() => {
      unlockMenu(user.username);
    }, 700);
  }, 900);
});

// ============ Forgot Password ============
document.getElementById('forgotForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('forgotEmail').value.trim();
  const button = event.currentTarget.querySelector('button[type="submit"]');

  const users = getUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    showMessage('forgotMessage', 'No account found with this email', 'error');
    return;
  }

  button.disabled = true;
  button.textContent = 'Sending...';

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    Username: user.username,
    Password: user.password,
    to_email: user.email
  }).then(() => {
    button.disabled = false;
    button.textContent = 'Send';
    document.getElementById('forgotForm').reset();
    showMessage('forgotMessage', 'Your account details have been sent to your email!', 'success');
  }).catch((err) => {
    button.disabled = false;
    button.textContent = 'Send';
    showMessage('forgotMessage', 'Something went wrong. Please try again.', 'error');
    console.error('EmailJS error:', err);
  });
});

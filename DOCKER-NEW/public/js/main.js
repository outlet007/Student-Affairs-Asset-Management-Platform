// Sidebar toggle for mobile
document.addEventListener('DOMContentLoaded', function() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && 
          !sidebar.contains(e.target) && 
          !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Delete confirmation
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const form = btn.closest('form') || document.getElementById(btn.dataset.form);
      const name = btn.dataset.name || 'รายการนี้';
      
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay active';
      overlay.innerHTML = `
        <div class="modal-content">
          <h3>⚠️ ยืนยันการลบ</h3>
          <p>คุณต้องการลบ "${name}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
          <div class="modal-actions">
            <button class="btn btn-outline modal-cancel">ยกเลิก</button>
            <button class="btn btn-danger modal-confirm">ลบ</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector('.modal-cancel').addEventListener('click', () => overlay.remove());
      overlay.querySelector('.modal-confirm').addEventListener('click', () => {
        if (form) form.submit();
        overlay.remove();
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
      });
    });
  });

  // Auto-dismiss alerts
  document.querySelectorAll('.alert').forEach(alert => {
    setTimeout(() => {
      alert.style.opacity = '0';
      alert.style.transform = 'translateY(-10px)';
      setTimeout(() => alert.remove(), 300);
    }, 5000);
  });

  // Theme toggle (Light/Dark mode)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const currentTheme = localStorage.getItem('theme') || 'light';
    themeToggle.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';

      // Smooth transition
      html.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      setTimeout(() => { html.style.transition = ''; }, 500);
    });
  }
});

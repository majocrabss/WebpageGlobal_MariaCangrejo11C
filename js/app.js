// app.js — Tab switching and initialization

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + target).classList.add('active');
      if (target === 'c8') setTimeout(updateC8, 50);
    });
  });

  initC8();
  initC9();

  window.addEventListener('resize', () => {
    if (document.querySelector('#tab-c8.active')) updateC8();
  });
});

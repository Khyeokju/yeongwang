function selectMen(gender) {
  localStorage.removeItem('selectGirl');
  localStorage.setItem('gender', 'male');
  window.location.href = 'egenman.html';
}
function selectGirl(gender) {
  localStorage.removeItem('selectMen');
  localStorage.setItem('gender', 'female');
  window.location.href = 'egengirl.html';
}
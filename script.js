const toggleButton = document.getElementById('toggle-Skills');
const skillsList = document.getElementById('skills-list');

toggleButton.addEventListener('click', () => {
    if (skillsList.style.display === 'none') {
        skillsList.style.display = 'block';
    } else {
        skillsList.style.display = 'none';
    }
});

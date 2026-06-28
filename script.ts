const toggleButton = document.getElementById('toggle-Skills') as HTMLButtonElement;
const skillsList = document.getElementById('skills-list') as HTMLElement;

toggleButton.addEventListener('click', () => {
    skillsList.style.display = (skillsList.style.display === 'none') ? 'block' : 'none';
});

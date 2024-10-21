var toggleButton = document.getElementById('toggle-Skills');
var skills = document.getElementById('Skills');
toggleButton.addEventListener('Click', function () {
    if (skills.style.display === 'none') {
        skills.style.display = 'block';
    }
    else {
        skills.style.display = 'none';
    }
});

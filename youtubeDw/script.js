let convertBtn = document.querySelector('.convert-button');
let URLinput = document.querySelector('.URL-input');

let port = 4200;

convertBtn.addEventListener('click', () => {
    console.log(`URL: ${URLinput.value}`);
    sendURL(URLinput.value);
});

function sendURL(URL)
{
    window.location.href = `http://localhost:${port}/download?URL=${URL}`;
}
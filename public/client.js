const socket = io("https://trevorserver.trevorfarias.com");

const lobbyId = window.location.pathname.split('/').pop();
let playerNumber = null;

socket.emit('join-lobby', lobbyId);

socket.on('lobby-full', () => {
  alert('Lobby is full! Redirecting to homepage.');
  window.location.href = '/';
});

socket.on('lobby-not-found', () => {
  alert('Lobby not found! Redirecting to homepage.');
  window.location.href = '/';
});

socket.on('joined', (data) => {
  playerNumber = data.playerNumber;
  document.getElementById('playerLabel').innerText = `You are Player ${playerNumber}`;
});

const square = document.getElementById('square');

square.addEventListener('click', () => {
  if (playerNumber === 1) {
    socket.emit('square-clicked', 'red');
  } else if (playerNumber === 2) {
    socket.emit('square-clicked', 'blue');
  }
});

socket.on('update-square', (color) => {
  square.style.backgroundColor = color;
});

const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('playPause');
const seekBar = document.getElementById('seekBar');
const volumeBar = document.getElementById('volumeBar');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const introScreen = document.getElementById('introScreen');
const container = document.querySelector('.container');
const slideBtn = document.getElementById('togglePage');

audio.volume = 0.1;

audio.addEventListener('loadedmetadata', () => {
  seekBar.max = audio.duration;
  endTime.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  seekBar.value = audio.currentTime;
  startTime.textContent = formatTime(audio.currentTime);
});

seekBar.addEventListener('input', () => {
  audio.currentTime = seekBar.value;
});

volumeBar.addEventListener('input', () => {
  audio.volume = volumeBar.value;
});

playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    audio.pause();
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

window.addEventListener('DOMContentLoaded', () => {
  introScreen.addEventListener("click", () => {
    introScreen.classList.add("hide");
    introScreen.style.opacity = '0';
    introScreen.style.pointerEvents = 'none';

    setTimeout(() => {
      const nowPlaying = document.getElementById('nowPlaying');
nowPlaying.classList.add('show');
setTimeout(() => {
  nowPlaying.classList.remove('show');
}, 3000);
      introScreen.style.display = "none";
      container.classList.remove("hidden");
      container.classList.add("show");
      slideBtn.classList.add("show");
      slideBtn.style.animation = "bubblePopBtn 0.4s ease";

      audio.play().then(() => {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }).catch(err => {
        console.log("Autoplay blocked:", err);
      });
    }, 500);
  });
});
const pages = document.querySelectorAll('.page');
let currentPage = 0;

pages.forEach((page, index) => {
  page.style.transform = `translateX(${index * 100}%)`;
});

slideBtn.addEventListener('click', () => {

  const newPage = (currentPage + 1) % pages.length;

  pages.forEach((page, index) => {
    const offset = (index - newPage) * 100;
    page.style.transform = `translateX(${offset}%)`;

    page.classList.toggle('active', index === newPage);
  });

  slideBtn.classList.remove('bubble-pop');
  void slideBtn.offsetWidth; // Wymuszenie restartu animacji
  slideBtn.classList.add('bubble-pop');

  slideBtn.innerHTML = newPage === 0 
    ? '<i class="fas fa-arrow-right"></i>' 
    : '<i class="fas fa-arrow-left"></i>';

  currentPage = newPage;
});
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && ['s', 'u', 'c'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});

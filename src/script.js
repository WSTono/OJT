const imageInput = document.getElementById("image-input");
const searchButton = document.getElementById("search-button");
const backButton = document.getElementById("back-button");
const initialScreen = document.getElementById("initial-screen");
const resultScreen = document.getElementById("result-screen");
const selectedImageContainer = document.getElementById(
  "selected-image-container"
);
const selectedImagePreview = document.getElementById("selected-image-preview");
const resultImageContainer = document.getElementById("result-image-container");
const canvas = document.getElementById("background-canvas");
const ctx = canvas.getContext("2d");

let imageBase64 = "";

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const caterpillars = Array.from({ length: 30 }, () => ({
  segments: Array.from({ length: 10 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
  })),
  dx: Math.random() * 1 - 0.5,
  dy: Math.random() * 1 - 0.5,
  color: `hsl(${Math.random() * 360}, 80%, 70%)`,
}));

function drawCaterpillars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let c of caterpillars) {
    for (let i = c.segments.length - 1; i > 0; i--) {
      c.segments[i].x = c.segments[i - 1].x;
      c.segments[i].y = c.segments[i - 1].y;
    }
    c.segments[0].x += c.dx;
    c.segments[0].y += c.dy;
    if (c.segments[0].x < 0 || c.segments[0].x > canvas.width) c.dx *= -1;
    if (c.segments[0].y < 0 || c.segments[0].y > canvas.height) c.dy *= -1;

    for (let i = 0; i < c.segments.length; i++) {
      ctx.beginPath();
      ctx.arc(c.segments[i].x, c.segments[i].y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = c.color;
      ctx.fill();
    }
  }
  requestAnimationFrame(drawCaterpillars);
}
drawCaterpillars();

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    imageBase64 = e.target.result.split(",")[1];
    selectedImageContainer.innerHTML = `<img src="${e.target.result}" alt="選択画像" />`;
  };
  reader.readAsDataURL(file);
});

searchButton.addEventListener("click", async () => {
  if (!imageBase64) {
    alert("画像選択してから検索しろや");
    return;
  }

  try {
    const res = await fetch(
      "https://image-search-site.azurewebsites.net/api/image_search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      }
    );

    if (!res.ok) throw new Error("APIエラー");

    const data = await res.json();
    const results = data.results.slice(0, 6);
    showResults(results);
  } catch (err) {
    alert("検索失敗だ、もう一回試せ");
    console.error(err);
  }
});

backButton.addEventListener("click", () => {
  resultScreen.classList.remove("active");
  initialScreen.classList.add("active");
  resultImageContainer.innerHTML = "";
  selectedImagePreview.innerHTML = "";
});

function showResults(images) {
  selectedImagePreview.innerHTML = selectedImageContainer.innerHTML;
  resultImageContainer.innerHTML = images
    .map((url) => `<img src="${url}" alt="検索結果画像" />`)
    .join("");

  initialScreen.classList.remove("active");
  resultScreen.classList.add("active");
}

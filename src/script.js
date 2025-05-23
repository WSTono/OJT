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

const flowers = Array.from({ length: 50 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 20 + 10,
  dx: Math.random() * 0.5 - 0.25,
  dy: Math.random() * 0.5 + 0.2,
  petalColor: `hsl(${Math.random() * 360}, 70%, 80%)`,
}));

function drawFlower(x, y, size, color) {
  const petalCount = 5;
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < petalCount; i++) {
    ctx.rotate((Math.PI * 2) / petalCount);
    ctx.beginPath();
    ctx.ellipse(0, size / 4, size / 2, size / 4, 0, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}

function drawFlowers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let flower of flowers) {
    drawFlower(flower.x, flower.y, flower.size, flower.petalColor);

    flower.x += flower.dx;
    flower.y += flower.dy;

    if (flower.y > canvas.height) flower.y = 0;
    if (flower.x > canvas.width) flower.x = 0;
    if (flower.x < 0) flower.x = canvas.width;
  }
  requestAnimationFrame(drawFlowers);
}
drawFlowers();

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

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

let imageBase64 = "";

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    imageBase64 = e.target.result.split(",")[1]; // Base64だけ取り出す
    selectedImageContainer.innerHTML = `<img src="${e.target.result}" alt="選択画像" />`;
  };
  reader.readAsDataURL(file);
});

searchButton.addEventListener("click", async () => {
  if (!imageBase64) {
    alert("画像選択してから検索");
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

    // 6枚だけ表示
    const results = data.results.slice(0, 6);
    showResults(results);
  } catch (err) {
    alert("検索失敗、もう一度お願いします");
    console.error(err);
  }
});

backButton.addEventListener("click", () => {
  // 初期画面に戻る
  resultScreen.classList.remove("active");
  initialScreen.classList.add("active");
  // 検索結果消す
  resultImageContainer.innerHTML = "";
  selectedImagePreview.innerHTML = "";
});

function showResults(images) {
  // 選択画像表示（検索結果画面）
  selectedImagePreview.innerHTML = selectedImageContainer.innerHTML;

  // 検索結果6枚を下に表示
  resultImageContainer.innerHTML = images
    .map((url) => `<img src="${url}" alt="検索結果画像" />`)
    .join("");

  // 画面切り替え
  initialScreen.classList.remove("active");
  resultScreen.classList.add("active");
}

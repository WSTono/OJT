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
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageBase64 = e.target.result.split(",")[1];
      selectedImageContainer.innerHTML = `<img src="${e.target.result}" />`;
    };
    reader.readAsDataURL(file);
  }
});

searchButton.addEventListener("click", async () => {
  if (!imageBase64) return alert("画像を選択しろ");

  const res = await fetch(
    "https://image-search-site.azurewebsites.net/api/image_search",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageBase64 }),
    }
  );

  const data = await res.json();
  showResults(data.results.slice(0, 6));
});

backButton.addEventListener("click", () => {
  resultScreen.classList.add("hidden");
  initialScreen.classList.remove("hidden");
});

function showResults(images) {
  selectedImagePreview.innerHTML = selectedImageContainer.innerHTML;
  resultImageContainer.innerHTML = images
    .map((url) => `<img src="${url}" />`)
    .join("");
  initialScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
}

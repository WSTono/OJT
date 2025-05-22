const initScreen = document.getElementById("initScreen");
const resultScreen = document.getElementById("resultScreen");
const imageInput = document.getElementById("imageInput");
const selectedImage = document.getElementById("selectedImage");
const resultSelectedImage = document.getElementById("resultSelectedImage");
const searchResults = document.getElementById("searchResults");
const searchBtn = document.getElementById("searchBtn");
const backBtn = document.getElementById("backBtn");

let imageBase64 = ""; // ← base64で保持

// ファイル選択時
imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    imageBase64 = e.target.result; // ここでbase64化済みデータURL取得
    selectedImage.src = imageBase64;
  };
  reader.readAsDataURL(file); // ← base64形式で読み込み
});

// 検索ボタン押下
searchBtn.addEventListener("click", async () => {
  if (!imageBase64) {
    alert("画像を選択してください。");
    return;
  }

  try {
    const response = await fetch(
      "https://image-search-site.azurewebsites.net/api/image_search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }), // ← base64をそのまま送信
      }
    );

    if (!response.ok) {
      throw new Error("検索APIの呼び出しに失敗しました。");
    }

    const result = await response.json();

    if (!Array.isArray(result)) {
      throw new Error("検索結果が配列ではありません。");
    }

    // 画面切り替えと結果表示
    initScreen.classList.remove("active");
    resultScreen.classList.add("active");
    resultSelectedImage.src = imageBase64;
    searchResults.innerHTML = "";

    result.forEach((imgUrl, index) => {
      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = `検索結果 ${index + 1}`;
      searchResults.appendChild(img);
    });
  } catch (err) {
    alert("エラー: " + err.message);
  }
});

// 戻るボタン
backBtn.addEventListener("click", () => {
  resultScreen.classList.remove("active");
  initScreen.classList.add("active");
});

// app.js

// クイズの進行状態
let currentIndex = 0;  // 何問目か（0スタート）
let scores = { E: 0, A: 0, O: 0, C: 0 };  // 特性ごとの合計点

// DOMの要素取得は、ページ読み込み完了後に行う
document.addEventListener("DOMContentLoaded", function () {
  // ページ要素
  const topPage = document.getElementById("top-page");
  const quizPage = document.getElementById("quiz-page");
  const resultPage = document.getElementById("result-page");

  // トップページ
  const startBtn = document.getElementById("start-btn");

  // 質問ページ
  const progressText = document.getElementById("quiz-progress-text");
  const questionText = document.getElementById("question-text");
  const choiceButtons = document.querySelectorAll(".choice-btn");
  const progressFill = document.getElementById("progress-fill");

  // 結果ページ
  const resultTypeText = document.getElementById("result-type-text");
  const resultTraitDescription = document.getElementById("result-trait-description");
  const resultSpotName = document.getElementById("result-spot-name");
  const resultSpotReason = document.getElementById("result-spot-reason");
  const resultImage = document.getElementById("result-image");
  const backToTopBtn = document.getElementById("back-to-top-btn");

  // ===== ページ切り替え用関数 =====
  function showPage(pageElem) {
    // すべて一旦非表示にしてから、表示したいページだけ表示
    [topPage, quizPage, resultPage].forEach(function (p) {
      p.classList.add("hidden");
    });
    pageElem.classList.remove("hidden");
  }

  // ===== クイズの初期化 =====
  function resetQuiz() {
    currentIndex = 0;
    scores = { E: 0, A: 0, O: 0, C: 0 };

    // 進捗バーを0に戻す
    updateProgressUI();

    // 結果画像をいったんクリア（なくても動くが一応）
    if (resultImage) {
      resultImage.src = "";
      resultImage.alt = "おすすめ観光地の画像";
    }
  }

  // ===== 質問の表示 =====
  function renderQuestion() {
    const question = QUESTIONS[currentIndex];
    if (!question) {
      return;
    }

    // 質問文
    questionText.textContent = question.text;

    // 何問目かの表示（例：5 / 16 問）
    progressText.textContent = (currentIndex + 1) + " / " + TOTAL_QUESTIONS + " 問";

    // 進捗バー更新
    updateProgressUI();

    // もし選択状態を視覚的に使うなら、ここでボタンのselectedクラスを一旦外す
    choiceButtons.forEach(function (btn) {
      btn.classList.remove("selected");
    });
  }

  // ===== 進捗バーの更新 =====
  function updateProgressUI() {
    const ratio = currentIndex / TOTAL_QUESTIONS; // 0.0 〜 1.0
    progressFill.style.width = (ratio * 100) + "%";
  }

  // ===== 回答がクリックされたとき =====
  function handleAnswer(score) {
    const question = QUESTIONS[currentIndex];
    if (!question) {
      return;
    }

    // 特性ごとのスコアに加算
    scores[question.trait] += score;

    // 次の質問へ
    currentIndex++;

    if (currentIndex < TOTAL_QUESTIONS) {
      renderQuestion();
    } else {
      // 全問回答したら結果表示へ
      showResult();
    }
  }

  // ===== 結果の計算と表示 =====
  function showResult() {
    // 最大スコアの特性を求める（同点の場合は TRAIT_PRIORITY の順で）
    let bestTrait = null;
    let bestScore = -1;

    TRAIT_PRIORITY.forEach(function (trait) {
      const score = scores[trait];
      if (score > bestScore) {
        bestScore = score;
        bestTrait = trait;
      }
    });

    // 念のためチェック
    if (!bestTrait) {
      bestTrait = "E";
    }

    const data = TRAIT_RESULT_DATA[bestTrait];

    // テキストの反映
    resultTypeText.textContent = "あなたは" + data.label + "が高い傾向にあります。";
    resultTraitDescription.textContent = data.description;
    resultSpotName.textContent = data.spotName;
    resultSpotReason.textContent = data.spotReason;

    // 画像の反映
    if (resultImage && data.imageUrl) {
      resultImage.src = data.imageUrl;
      resultImage.alt = data.spotName + "の画像";
    }

    // 結果ページを表示
    showPage(resultPage);
  }

  // ===== イベント設定 =====

  // 「診断スタート」ボタン
  startBtn.addEventListener("click", function (e) {
    e.preventDefault(); // aタグのデフォルト動作（ページトップへジャンプ）を防ぐ

    resetQuiz();
    showPage(quizPage);
    renderQuestion();
  });

  // 回答ボタン（1〜5）
  choiceButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const score = Number(btn.dataset.score);
      if (!score) return;

      // 選択状態の見た目をつけたい場合
      choiceButtons.forEach(function (b) {
        b.classList.remove("selected");
      });
      btn.classList.add("selected");

      // 少し間を置いて次の質問に進みたい場合は setTimeout でもOKだが、
      // ここではすぐ次の質問へ進める
      handleAnswer(score);
    });
  });

  // 「トップに戻る」ボタン
  backToTopBtn.addEventListener("click", function () {
    resetQuiz();
    showPage(topPage);
  });

  // 初期表示はトップページ
  showPage(topPage);
});

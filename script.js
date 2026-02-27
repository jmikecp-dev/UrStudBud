// ===== NAVIGATION HELPERS =====
function goTo(page) {
  window.location.href = page;
}

// ===== INDEX PAGE =====
function initHome() {
  $('#get-started-btn').on('click', function () {
    goTo('login.html');
  });
  $('#hamburger-btn').on('click', function () {
    goTo('menu.html');
  });
}

// ===== LOGIN PAGE =====
function initLogin() {
  $('#back-btn').on('click', function () {
    goTo('index.html');
  });
  $('#sign-in-btn').on('click', function () {
    goTo('ready.html');
  });
  $('#google-btn').on('click', function () {
    alert('Google Sign-in coming soon!');
  });
  $('#facebook-btn').on('click', function () {
    alert('Facebook Sign-in coming soon!');
  });
  $('#signup-link').on('click', function (e) {
    e.preventDefault();
    alert('Sign Up page coming soon!');
  });
}

// ===== MENU PAGE =====
function initMenu() {
  $('#close-menu-btn').on('click', function () { goTo('index.html'); });
  $('#study-methods-btn').on('click', function () { goTo('ready.html'); });
  $('#my-learnings-btn').on('click', function () { goTo('my-learnings.html'); });
  $('#about-btn').on('click', function () { goTo('about.html'); });
  $('#contact-btn').on('click', function () { goTo('contact.html'); });
}

// ===== SESSION TRACKING HELPERS =====
function logSession(data) {
  const history = getHistory();
  history.unshift({
    id        : Date.now(),
    method    : data.method,
    label     : data.methodLabel,
    icon      : data.methodIcon,
    score     : data.score !== undefined ? data.score : null,
    total     : data.total !== undefined ? data.total : null,
    detail    : data.detail || '',
    notes     : data.notes || '',
    savedData : data.savedData || null,
    date      : new Date().toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' })
  });
  if (history.length > 50) history.length = 50;
  sessionStorage.setItem('urStudBudHistory', JSON.stringify(history));
}
function getHistory() {
  try { return JSON.parse(sessionStorage.getItem('urStudBudHistory') || '[]'); }
  catch(e) { return []; }
}
function getSessionById(id) {
  return getHistory().find(function(h){ return h.id === id; }) || null;
}


function initReady() {
  $('#yes-btn').on('click', function () {
    goTo('quiz.html');
  });
  $('#no-btn').on('click', function () {
    sessionStorage.setItem('showAll', 'true');
    goTo('results.html');
  });
  $('#menu-btn').on('click', function () {
    goTo('menu.html');
  });
}

// ===== QUIZ PAGE =====
function initQuiz() {
  const answers = { 1: null, 2: null, 3: null, 4: null };

  $(document).on('click', '.quiz-yn', function () {
    const q = $(this).data('q');
    const val = $(this).data('val');
    answers[q] = val;
    $(`.quiz-yn[data-q="${q}"]`).removeClass('selected');
    $(this).addClass('selected');
  });

  $('#submit-btn').on('click', function () {
    const unanswered = Object.values(answers).some(a => a === null);
    if (unanswered) {
      alert('Please answer all questions before submitting!');
      return;
    }
    sessionStorage.setItem('quizAnswers', JSON.stringify(answers));
    sessionStorage.removeItem('showAll');
    goTo('results.html');
  });

  $('#menu-btn').on('click', function () {
    goTo('menu.html');
  });
}

// ===== RESULTS PAGE =====
function initResults() {
  const allMethods = [
    { icon: '📖', label: 'READING AND WRITING', q: 1, page: 'reading-writing.html' },
    { icon: '🏆', label: 'PRACTICE - ORIENTED',  q: 2, page: 'practice-oriented.html' },
    { icon: '⏱',  label: 'FOCUSED - SESSION',    q: 3, page: 'focused-session.html' },
    { icon: '🃏', label: 'SPACED - REPETITION',  q: 4, page: 'spaced-repetition.html' },
  ];

  const $list = $('#results-list');
  const showAll = sessionStorage.getItem('showAll') === 'true';
  const rawAnswers = sessionStorage.getItem('quizAnswers');
  const answers = rawAnswers ? JSON.parse(rawAnswers) : {};

  const matched = showAll ? allMethods : allMethods.filter(m => answers[m.q] === 'yes');

  if (matched.length === 0) {
    $list.html('<p style="color:#555;font-size:0.9rem;padding:10px;">No methods matched. Try answering YES to some questions!</p>');
  } else {
    $.each(matched, function (i, m) {
      const clickable = m.page ? 'result-item clickable-result' : 'result-item';
      const arrow = m.page ? '<span class="result-arrow">›</span>' : '';
      const $item = $(`
        <div class="${clickable}" data-page="${m.page || ''}">
          <div class="result-icon">${m.icon}</div>
          <div class="result-label">${m.label}</div>
          ${arrow}
        </div>
      `);
      $list.append($item);
    });
  }

  // Click on clickable results
  $(document).on('click', '.clickable-result', function () {
    const page = $(this).data('page');
    if (page) goTo(page);
  });

  $('#menu-btn').on('click', function () {
    goTo('menu.html');
  });
}

// ===== READING & WRITING PAGE =====
function initReadingWriting() {

  const $dropzone   = $('#rw-dropzone');
  const $fileInput  = $('#rw-file-input');
  const $reviewerWrap = $('#rw-reviewer-wrap');
  const $reviewer   = $('#rw-reviewer');
  const $loading    = $('#rw-loading');
  const $fileName   = $('#rw-file-name');
  const $dzInner    = $('#rw-dropzone-inner');

  // Back button
  $('#rw-back-btn').on('click', function () {
    goTo('results.html');
  });

  // Other study methods button
  $('#rw-other-btn').on('click', function () {
    goTo('results.html');
  });

  // Click on dropzone opens file browser
  $dropzone.on('click', function (e) {
    if (!$(e.target).hasClass('rw-browse-link')) {
      $fileInput.trigger('click');
    }
  });

  // Browse link
  $('#rw-file-input').on('change', function () {
    const file = this.files[0];
    if (file) processFile(file);
  });

  // Drag & drop events
  $dropzone.on('dragover dragenter', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $dropzone.addClass('drag-over');
  });
  $dropzone.on('dragleave dragend drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $dropzone.removeClass('drag-over');
  });
  $dropzone.on('drop', function (e) {
    const file = e.originalEvent.dataTransfer.files[0];
    if (file) processFile(file);
  });

  // Clear reviewer
  $('#rw-clear-btn').on('click', function () {
    $reviewerWrap.hide();
    $dzInner.show();
    $dropzone.show();
    $reviewer.html('');
    $fileName.text('');
    $fileInput.val('');
  });

  // ---- FILE PROCESSOR ----
  function processFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    $dropzone.hide();
    $loading.show();
    $reviewerWrap.hide();

    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        showReviewer(file.name, formatTxtReviewer(text));
      };
      reader.readAsText(file);

    } else if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = function (e) {
        mammoth.convertToHtml({ arrayBuffer: e.target.result })
          .then(function (result) {
            showReviewer(file.name, result.value || '<p>Could not parse document content.</p>');
          })
          .catch(function () {
            showReviewer(file.name, '<p style="color:red;">Error reading .docx file.</p>');
          });
      };
      reader.readAsArrayBuffer(file);

    } else if (ext === 'pdf') {
      // For PDF: read as text using FileReader (basic fallback)
      $loading.hide();
      $dropzone.show();
      showReviewer(file.name,
        '<p style="color:#a07830;font-weight:700;">⚠ PDF direct reading is limited in browser.<br>For best results, copy-paste your PDF text into a .txt file and upload that instead.</p>'
      );

    } else {
      $loading.hide();
      $dropzone.show();
      alert('Unsupported file type. Please upload a .txt or .docx file.');
    }
  }

  // ---- FORMAT TXT into reviewer ----
  function formatTxtReviewer(raw) {
    // Split into paragraphs, wrap in <p> tags, add basic heading detection
    const lines = raw.split('\n');
    let html = '';
    lines.forEach(function (line) {
      const trimmed = line.trim();
      if (!trimmed) {
        html += '<br/>';
      } else if (trimmed.length < 60 && trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
        html += `<h3 style="color:#4a2c0a;font-family:'Playfair Display',serif;margin:12px 0 4px;">${trimmed}</h3>`;
      } else {
        html += `<p style="margin-bottom:6px;">${trimmed}</p>`;
      }
    });
    return html;
  }

  // ---- SHOW REVIEWER ----
  function showReviewer(name, htmlContent) {
    $loading.hide();
    $fileName.text('📄 ' + name);
    $reviewer.html(htmlContent);
    $reviewerWrap.show();
  }
}

// ===== PRACTICE - ORIENTED PAGE =====
function initPracticeOriented() {

  // ---- State ----
  let questions = [];       // [{q, a}, ...]
  let shuffled  = [];       // shuffled copy for practice
  let currentIdx = 0;
  let score = 0;
  let userAnswers = [];     // [{q, yourAnswer, correctAnswer, correct}, ...]

  // ---- Navigation ----
  $('#po-back-btn').on('click', function () { goTo('results.html'); });
  $('#po-other-btn-add, #po-other-btn-practice, #po-other-btn-score').on('click', function () {
    goTo('results.html');
  });

  // ---- ADD SCREEN ----

  // Auto-add first card on load OR restore from My Learnings
  const restoredPO = sessionStorage.getItem('ml_restore_po');
  if (restoredPO) {
    sessionStorage.removeItem('ml_restore_po');
    try {
      const savedQs = JSON.parse(restoredPO);
      savedQs.forEach(function(q, i) {
        addQuestionCard();
        const $cards = $('#po-questions-list .po-question-card');
        $cards.last().find('.po-q-input').val(q.q);
        $cards.last().find('.po-a-input').val(q.a);
      });
    } catch(e) { addQuestionCard(); }
  } else {
    addQuestionCard();
  }

  $('#po-add-question-btn').on('click', function () {
    addQuestionCard();
  });

  function addQuestionCard() {
    const idx = $('#po-questions-list .po-question-card').length + 1;
    const $card = $(`
      <div class="po-question-card" data-id="${idx}">
        <button class="po-card-delete" title="Remove">✕</button>
        <div class="po-card-num">QUESTION ${idx}</div>
        <div class="po-card-field">
          <label>Problem / Question</label>
          <textarea class="po-q-input" placeholder="Type your question here…" rows="2"></textarea>
        </div>
        <div class="po-card-field">
          <label>Answer / Solution</label>
          <textarea class="po-a-input" placeholder="Type the correct answer here…" rows="2"></textarea>
        </div>
      </div>
    `);
    $('#po-questions-list').append($card);
    // Scroll to new card
    setTimeout(function() {
      $('.po-add-body').animate({ scrollTop: $('.po-add-body')[0].scrollHeight }, 300);
    }, 50);
  }

  // Delete card
  $(document).on('click', '.po-card-delete', function () {
    const $list = $('#po-questions-list');
    if ($list.find('.po-question-card').length === 1) {
      alert('You need at least one question!');
      return;
    }
    $(this).closest('.po-question-card').remove();
    // Renumber
    $list.find('.po-question-card').each(function(i) {
      $(this).find('.po-card-num').text('QUESTION ' + (i + 1));
    });
  });

  // Start answering
  $('#po-start-btn').on('click', function () {
    // Collect questions
    questions = [];
    let valid = true;
    $('#po-questions-list .po-question-card').each(function() {
      const q = $(this).find('.po-q-input').val().trim();
      const a = $(this).find('.po-a-input').val().trim();
      if (!q || !a) { valid = false; return false; }
      questions.push({ q, a });
    });
    if (!valid) {
      alert('Please fill in all questions and answers before starting!');
      return;
    }
    startPractice();
  });

  // ---- PRACTICE SCREEN ----

  function startPractice() {
    // Shuffle questions
    shuffled = [...questions].sort(() => Math.random() - 0.5);
    currentIdx = 0;
    score = 0;
    userAnswers = [];
    showScreen('po-screen-practice');
    loadQuestion();
  }

  function loadQuestion() {
    const total = shuffled.length;
    const q = shuffled[currentIdx];

    // Progress
    $('#po-q-current').text(currentIdx + 1);
    $('#po-q-total').text(total);
    const pct = ((currentIdx) / total) * 100;
    $('#po-progress-fill').css('width', pct + '%');

    // Display question
    $('#po-question-display').text(q.q);

    // Reset answer area
    $('#po-answer-input').val('').prop('disabled', false).show();
    $('#po-feedback').hide().removeClass('correct wrong');
    $('#po-submit-answer-btn').show().prop('disabled', false);
    $('#po-next-btn').hide();

    // Focus
    setTimeout(function() { $('#po-answer-input').focus(); }, 100);
  }

  // Check answer
  $('#po-submit-answer-btn').on('click', function () {
    const userAns = $('#po-answer-input').val().trim();
    if (!userAns) {
      alert('Please write your answer first!');
      return;
    }
    const correctAns = shuffled[currentIdx].a;
    const isCorrect = userAns.toLowerCase() === correctAns.toLowerCase();

    // Save result
    userAnswers.push({
      q: shuffled[currentIdx].q,
      yourAnswer: userAns,
      correctAnswer: correctAns,
      correct: isCorrect
    });
    if (isCorrect) score++;

    // Show feedback
    $('#po-answer-input').prop('disabled', true);
    $('#po-submit-answer-btn').prop('disabled', true).hide();

    const $fb = $('#po-feedback');
    if (isCorrect) {
      $fb.addClass('correct').html(`
        <span class="po-feedback-icon">✅</span>
        <span class="po-feedback-text">
          <strong>CORRECT!</strong> Great job!
        </span>
      `);
    } else {
      $fb.addClass('wrong').html(`
        <span class="po-feedback-icon">❌</span>
        <span class="po-feedback-text">
          <strong>INCORRECT.</strong> Your answer: "${userAns}"
          <span class="po-feedback-correct-ans">✔ Correct answer: <strong>${correctAns}</strong></span>
        </span>
      `);
    }
    $fb.show();

    // Show next / finish
    const isLast = currentIdx === shuffled.length - 1;
    if (isLast) {
      $('#po-next-btn').text('SEE RESULTS 🏆').show();
    } else {
      $('#po-next-btn').text('NEXT QUESTION ›').show();
    }
  });

  // Next question
  $('#po-next-btn').on('click', function () {
    const isLast = currentIdx === shuffled.length - 1;
    if (isLast) {
      showScore();
    } else {
      currentIdx++;
      loadQuestion();
    }
  });

  // ---- SCORE SCREEN ----

  function showScore() {
    const total = shuffled.length;
    const pct = Math.round((score / total) * 100);

    $('#po-score-num').text(score);
    $('#po-score-denom').text('/' + total);

    // Message based on score
    let msg = '';
    if (pct === 100)      msg = '🎉 PERFECT SCORE! You nailed it!';
    else if (pct >= 75)   msg = '👏 GREAT WORK! Almost perfect!';
    else if (pct >= 50)   msg = '💪 GOOD EFFORT! Keep practicing!';
    else                  msg = '📖 KEEP STUDYING! You\'ll get there!';
    $('#po-score-msg').text(msg);

    // Review list
    const $review = $('#po-review-list').empty();
    // Add label once
    if ($('#po-review-label').length === 0) {
      $review.before('<div class="po-review-title" id="po-review-label">REVIEW YOUR ANSWERS</div>');
    }
    $.each(userAnswers, function(i, r) {
      const cls = r.correct ? 'correct' : 'wrong';
      const icon = r.correct ? '✅' : '❌';
      const wrongLine = r.correct ? '' : `
        <div class="po-review-correct-ans">✔ Correct answer: <span>${r.correctAnswer}</span></div>`;
      $review.append(`
        <div class="po-review-item ${cls}">
          <div class="po-review-q">
            <span class="po-review-q-icon">${icon}</span>
            <span>Q${i+1}: ${r.q}</span>
          </div>
          <div class="po-review-your">Your answer: <span>${r.yourAnswer}</span></div>
          ${wrongLine}
        </div>
      `);
    });

    // Progress bar to 100%
    $('#po-progress-fill').css('width', '100%');

    // Log to My Learnings
    logSession({
      method      : 'practice-oriented',
      methodLabel : 'Practice-Oriented',
      methodIcon  : '🏆',
      score       : score,
      total       : shuffled.length,
      detail      : `Answered ${shuffled.length} question${shuffled.length !== 1 ? 's' : ''}`,
      savedData   : { questions: questions }
    });

    showScreen('po-screen-score');
  }

  // Retry — reshuffle same questions
  $('#po-retry-btn').on('click', function () {
    startPractice();
  });

  // Edit questions — go back to add screen
  $('#po-edit-btn').on('click', function () {
    showScreen('po-screen-add');
  });

  // ---- HELPER: show/hide screens ----
  function showScreen(id) {
    $('.po-screen').hide();
    $('#' + id).show();
  }
}

// ===== FOCUSED SESSION PAGE =====
function initFocusedSession() {

  // ---- State ----
  let studyMinutes = 30;
  let fileContent  = '';
  let timerInterval = null;
  let timerSeconds  = 0;

  // ---- Navigation ----
  $('#fs-back-btn').on('click', function () { goTo('results.html'); });
  $('#fs-other-setup, #fs-other-plan, #fs-other-study, #fs-other-break, #fs-other-recap, #fs-other-choose, #fs-other-longer').on('click', function () {
    clearTimer();
    goTo('results.html');
  });

  // ---- HELPERS ----
  function showScreen(id) {
    $('.fs-screen').hide();
    $('#' + id).show();
  }

  function clearTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function startTimer(seconds, $badge, onEnd) {
    clearTimer();
    timerSeconds = seconds;
    updateBadge($badge, timerSeconds);
    timerInterval = setInterval(function () {
      timerSeconds--;
      updateBadge($badge, timerSeconds);
      if (timerSeconds <= 10) $badge.addClass('urgent');
      if (timerSeconds <= 0) {
        clearTimer();
        $badge.removeClass('urgent').text('00:00');
        if (onEnd) onEnd();
      }
    }, 1000);
  }

  function updateBadge($badge, secs) {
    const m = Math.floor(Math.abs(secs) / 60).toString().padStart(2, '0');
    const s = (Math.abs(secs) % 60).toString().padStart(2, '0');
    $badge.text(m + ':' + s);
  }

  function setPhaseActive(phaseId) {
    $('.fs-phase-step').removeClass('active');
    $('#fsp-' + phaseId).addClass('active');
    // Mark previous ones as done
    const order = ['plan','study','break','recap','choose'];
    const idx = order.indexOf(phaseId);
    order.forEach(function(p, i) {
      if (i < idx) $('#fsp-' + p).addClass('done').removeClass('active');
    });
  }

  // ---- SETUP SCREEN ----

  // Timer preset
  $(document).on('click', '.fs-preset-btn', function () {
    $('.fs-preset-btn').removeClass('active');
    $(this).addClass('active');
    studyMinutes = parseInt($(this).data('min'));
  });

  // File drop
  $('#fs-dropzone').on('click', function (e) {
    if (!$(e.target).hasClass('rw-browse-link')) $('#fs-file-input').trigger('click');
  });
  $('#fs-file-input').on('change', function () {
    const file = this.files[0];
    if (file) handleSetupFile(file);
  });
  $('#fs-dropzone').on('dragover dragenter', function (e) {
    e.preventDefault(); $(this).addClass('drag-over');
  });
  $('#fs-dropzone').on('dragleave dragend drop', function (e) {
    e.preventDefault(); $(this).removeClass('drag-over');
  });
  $('#fs-dropzone').on('drop', function (e) {
    const file = e.originalEvent.dataTransfer.files[0];
    if (file) handleSetupFile(file);
  });
  $('#fs-file-clear-btn').on('click', function () {
    fileContent = '';
    $('#fs-file-loaded').hide();
    $('#fs-dropzone').show();
    $('#fs-file-input').val('');
  });

  function handleSetupFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = function (e) {
        fileContent = e.target.result;
        showFileLoaded(file.name);
      };
      reader.readAsText(file);
    } else if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = function (e) {
        mammoth.convertToHtml({ arrayBuffer: e.target.result }).then(function (r) {
          fileContent = r.value;
          showFileLoaded(file.name);
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a .txt or .docx file.');
    }
  }

  function showFileLoaded(name) {
    $('#fs-dropzone').hide();
    $('#fs-file-loaded-name').text('📄 ' + name);
    $('#fs-file-loaded').show();
  }

  // Restore from My Learnings if available
  const restoredFS = sessionStorage.getItem('ml_restore_fs');
  if (restoredFS) {
    sessionStorage.removeItem('ml_restore_fs');
    try {
      const d = JSON.parse(restoredFS);
      if (d.goal)        $('#fs-goal-input').val(d.goal);
      if (d.studyMinutes) {
        studyMinutes = d.studyMinutes;
        $('.fs-preset-btn').removeClass('active');
        $(`.fs-preset-btn[data-min="${d.studyMinutes}"]`).addClass('active');
      }
    } catch(e) {}
  }

  // Begin session
  $('#fs-begin-btn').on('click', function () {
    $('#fs-phase-strip').show();
    startPlanPhase();
  });

  // ---- PHASE 1: PLAN ----
  function startPlanPhase() {
    showScreen('fs-screen-plan');
    setPhaseActive('plan');
    startTimer(120, $('#fs-timer-plan'), function () {
      flashPhaseComplete('Time to start studying!');
    });
  }
  $('#fs-plan-skip').on('click', function () { clearTimer(); });
  $('#fs-plan-next').on('click', function () { clearTimer(); startStudyPhase(); });

  // ---- PHASE 2: STUDY ----
  function startStudyPhase() {
    showScreen('fs-screen-study');
    setPhaseActive('study');

    // Show goal if set
    const goal = $('#fs-goal-input').val().trim();
    if (goal) {
      $('#fs-goal-reminder-text').text(goal);
      $('#fs-goal-reminder').show();
    }

    // Show document if uploaded
    if (fileContent) {
      $('#fs-doc-placeholder').hide();
      $('#fs-doc-content').html(fileContent).show();
    }

    startTimer(studyMinutes * 60, $('#fs-timer-study'), function () {
      flashPhaseComplete('Study time is up! Time for a break.');
    });
  }
  $('#fs-study-skip').on('click', function () { clearTimer(); });
  $('#fs-study-next').on('click', function () { clearTimer(); startBreakPhase(); });

  // ---- PHASE 3: BREAK ----
  function startBreakPhase() {
    showScreen('fs-screen-break');
    setPhaseActive('break');
    startTimer(300, $('#fs-timer-break'), function () {
      flashPhaseComplete('Break over! Time to recap.');
    });
  }
  $('#fs-break-skip').on('click', function () { clearTimer(); });
  $('#fs-break-next').on('click', function () { clearTimer(); startRecapPhase(); });

  // ---- PHASE 4: RECAP ----
  function startRecapPhase() {
    showScreen('fs-screen-recap');
    setPhaseActive('recap');
    startTimer(300, $('#fs-timer-recap'), function () {
      flashPhaseComplete('Recap time is up!');
    });
  }
  $('#fs-recap-skip').on('click', function () { clearTimer(); });
  $('#fs-recap-next').on('click', function () { clearTimer(); startChoosePhase(); });

  // ---- PHASE 5: CHOOSE ----
  function startChoosePhase() {
    showScreen('fs-screen-choose');
    setPhaseActive('choose');
    // Fill session summary
    const goal   = $('#fs-goal-input').val().trim() || 'No goal set';
    const plan   = $('#fs-plan-text').val().trim() || 'No plan written';
    const recap  = $('#fs-recap-text').val().trim() || 'No recap written';
    $('#fs-summary-goal').text('Goal: ' + goal);
    $('#fs-summary-plan').text('Plan: ' + plan.substring(0, 120) + (plan.length > 120 ? '…' : ''));
    $('#fs-summary-recap').text('Recap: ' + recap.substring(0, 120) + (recap.length > 120 ? '…' : ''));

    // Log to My Learnings
    logSession({
      method      : 'focused-session',
      methodLabel : 'Focused Session',
      methodIcon  : '⏱',
      detail      : 'Goal: ' + goal,
      notes       : recap.substring(0, 100),
      savedData   : {
        goal        : $('#fs-goal-input').val().trim(),
        plan        : $('#fs-plan-text').val().trim(),
        studyNotes  : $('#fs-study-notes').val().trim(),
        recap       : $('#fs-recap-text').val().trim(),
        studyMinutes: studyMinutes
      }
    });
  }

  // Continue studying → restart from Plan
  $('#fs-choose-continue').on('click', function () {
    // Clear phase notes for new session but keep document
    $('#fs-plan-text').val('');
    $('#fs-study-notes').val('');
    $('#fs-recap-text').val('');
    // Reset phase strip
    $('.fs-phase-step').removeClass('active done');
    startPlanPhase();
  });

  // Longer break
  $('#fs-choose-longer-break').on('click', function () {
    showScreen('fs-screen-longer-break');
    startTimer(900, $('#fs-timer-longer'), function () {
      flashPhaseComplete('Longer break over! Ready for a new session.');
    });
  });
  $('#fs-longer-skip').on('click', function () { clearTimer(); });
  $('#fs-longer-next').on('click', function () {
    clearTimer();
    $('#fs-plan-text').val('');
    $('#fs-study-notes').val('');
    $('#fs-recap-text').val('');
    $('.fs-phase-step').removeClass('active done');
    startPlanPhase();
  });

  // Change topic → go back to setup
  $('#fs-choose-change').on('click', function () {
    clearTimer();
    // Reset everything
    fileContent = '';
    $('#fs-file-loaded').hide();
    $('#fs-dropzone').show();
    $('#fs-file-input').val('');
    $('#fs-goal-input').val('');
    $('#fs-plan-text').val('');
    $('#fs-study-notes').val('');
    $('#fs-recap-text').val('');
    $('#fs-doc-content').html('').hide();
    $('#fs-doc-placeholder').show();
    $('#fs-goal-reminder').hide();
    $('#fs-phase-strip').hide();
    $('.fs-phase-step').removeClass('active done');
    showScreen('fs-screen-setup');
  });

  // ---- Flash notification ----
  function flashPhaseComplete(msg) {
    const $flash = $('<div class="fs-flash-msg">' + msg + '</div>');
    $('body').append($flash);
    setTimeout(function () { $flash.addClass('visible'); }, 50);
    setTimeout(function () { $flash.removeClass('visible'); setTimeout(function(){ $flash.remove(); }, 400); }, 3000);
  }
}

// ===== SPACED REPETITION PAGE =====
function initSpacedRepetition() {

  // ---- State ----
  let blanksQueue  = [];   // [{topicTitle, topicText, blankWord, blankIndex, displayHtml, allBlanks}, ...]
  let currentBlank = 0;
  let score        = 0;
  let userAnswers  = [];   // [{topicTitle, sentence, word, yourAnswer, correct}, ...]

  // Words to skip when blanking (too short or common)
  const SKIP_WORDS = new Set([
    'a','an','the','is','are','was','were','be','been','being',
    'i','it','in','on','at','to','of','or','and','but','for',
    'not','no','by','as','if','do','did','has','had','have',
    'this','that','these','those','with','from','its','so','we',
    'he','she','they','our','my','your','his','her','their',
    'into','than','then','when','will','can','may','also','all',
    'up','us','an','am','about','after','which','who','how','what'
  ]);

  // ---- Navigation ----
  $('#sr-back-btn').on('click', function () { goTo('results.html'); });
  $('#sr-other-setup, #sr-other-quiz, #sr-other-score').on('click', function () { goTo('results.html'); });

  // ---- SCREEN HELPER ----
  function showScreen(id) {
    $('.sr-screen').hide();
    $('#' + id).show();
  }

  // ---- SETUP SCREEN ----

  // Auto-add first card OR restore from My Learnings
  const restoredSR = sessionStorage.getItem('ml_restore_sr');
  if (restoredSR) {
    sessionStorage.removeItem('ml_restore_sr');
    try {
      const savedTopics = JSON.parse(restoredSR);
      savedTopics.forEach(function(t) {
        addTopicCard();
        const $cards = $('#sr-topics-list .sr-topic-card');
        $cards.last().find('.sr-title-input').val(t.title || '');
        $cards.last().find('.sr-para-input').val(t.para || '');
      });
    } catch(e) { addTopicCard(); }
  } else {
    addTopicCard();
  }

  $('#sr-add-topic-btn').on('click', function () { addTopicCard(); });

  function addTopicCard() {
    const idx = $('#sr-topics-list .sr-topic-card').length + 1;
    const $card = $(`
      <div class="sr-topic-card" data-id="${idx}">
        <button class="sr-card-delete" title="Remove">✕</button>
        <div class="sr-card-num">TOPIC ${idx}</div>
        <div class="sr-card-field">
          <label>Topic Title</label>
          <input type="text" class="sr-title-input" placeholder="e.g. Chapter 1 — The Water Cycle"/>
        </div>
        <div class="sr-card-field">
          <label>Paragraph / Reviewer Text</label>
          <textarea class="sr-para-input" placeholder="Paste or type your paragraph here. Key words will be randomly blanked out for you to fill in…"></textarea>
          <span class="sr-card-hint">Tip: Use complete sentences with important keywords for best results.</span>
        </div>
      </div>
    `);
    $('#sr-topics-list').append($card);
    setTimeout(function () {
      $('.sr-setup-body').animate({ scrollTop: $('.sr-setup-body')[0].scrollHeight }, 300);
    }, 50);
  }

  // Delete card
  $(document).on('click', '.sr-card-delete', function () {
    const $list = $('#sr-topics-list');
    if ($list.find('.sr-topic-card').length === 1) {
      alert('You need at least one topic!');
      return;
    }
    $(this).closest('.sr-topic-card').remove();
    $list.find('.sr-topic-card').each(function (i) {
      $(this).find('.sr-card-num').text('TOPIC ' + (i + 1));
    });
  });

  // Start review
  $('#sr-start-btn').on('click', function () {
    const topics = [];
    let valid = true;
    $('#sr-topics-list .sr-topic-card').each(function () {
      const title = $(this).find('.sr-title-input').val().trim();
      const para  = $(this).find('.sr-para-input').val().trim();
      if (!para) { valid = false; return false; }
      topics.push({ title: title || 'Topic', para });
    });
    if (!valid) {
      alert('Please fill in at least one paragraph before starting!');
      return;
    }
    buildBlanksQueue(topics);
    if (blanksQueue.length === 0) {
      alert('No key words found to blank out. Try writing longer paragraphs with more specific terms!');
      return;
    }
    startQuiz();
  });

  // ---- BLANK GENERATION ----
  function buildBlanksQueue(topics) {
    blanksQueue = [];
    topics.forEach(function (topic) {
      const words = extractKeyWords(topic.para);
      // Pick ~25% of keywords, min 2, max 8 per topic
      const pickCount = Math.max(2, Math.min(8, Math.ceil(words.length * 0.25)));
      const picked = shuffle(words).slice(0, pickCount);

      picked.forEach(function (wordObj) {
        blanksQueue.push({
          topicTitle : topic.title,
          topicText  : topic.para,
          blankWord  : wordObj.word,
          blankStart : wordObj.start,
          blankEnd   : wordObj.end
        });
      });
    });
    // Shuffle queue
    blanksQueue = shuffle(blanksQueue);
  }

  function extractKeyWords(text) {
    const results = [];
    // Tokenise — find words >= 4 chars, not in skip list
    const regex = /\b([A-Za-z][a-zA-Z]{3,})\b/g;
    let match;
    const seen = new Set();
    while ((match = regex.exec(text)) !== null) {
      const word = match[1];
      const lower = word.toLowerCase();
      if (!SKIP_WORDS.has(lower) && !seen.has(lower)) {
        seen.add(lower);
        results.push({ word, start: match.index, end: match.index + word.length });
      }
    }
    return results;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- QUIZ SCREEN ----
  function startQuiz() {
    currentBlank = 0;
    score = 0;
    userAnswers = [];
    showScreen('sr-screen-quiz');
    loadBlank();
  }

  function loadBlank() {
    const total = blanksQueue.length;
    const item  = blanksQueue[currentBlank];

    // Progress
    $('#sr-blank-current').text(currentBlank + 1);
    $('#sr-blank-total').text(total);
    $('#sr-progress-fill').css('width', (currentBlank / total * 100) + '%');

    // Topic label
    $('#sr-topic-label').text('📂 ' + item.topicTitle);

    // Build paragraph HTML — highlight the active blank, show previous answers
    renderParagraph(item);

    // Reset input & buttons
    $('#sr-answer-input').val('').prop('disabled', false).focus();
    $('#sr-feedback').hide().removeClass('correct wrong');
    $('#sr-check-btn').show().prop('disabled', false);
    $('#sr-next-btn').hide();
  }

  function renderParagraph(item) {
    const text = item.topicText;
    let html = '';
    let cursor = 0;

    // Collect all blanks for this topicText that have been answered or are current
    const relatedAnswered = userAnswers.filter(function (a) {
      return a.topicTitle === item.topicTitle;
    });

    // Build a map of positions to replace
    const replaceMap = {};
    // Current blank
    replaceMap[item.blankStart] = { word: item.blankWord, end: item.blankEnd, status: 'active' };
    // Previous answered blanks for same topic
    relatedAnswered.forEach(function (a) {
      if (a.blankStart !== undefined) {
        replaceMap[a.blankStart] = {
          word: a.word,
          end:  a.blankEnd,
          status: a.correct ? 'correct' : 'wrong',
          display: a.correct ? a.word : a.yourAnswer
        };
      }
    });

    const positions = Object.keys(replaceMap).map(Number).sort(function (a, b) { return a - b; });

    positions.forEach(function (pos) {
      const entry = replaceMap[pos];
      // Text before this blank
      html += escapeHtml(text.slice(cursor, pos));
      const blankLen = entry.word.length;
      const minW = Math.max(60, blankLen * 10) + 'px';

      if (entry.status === 'active') {
        html += `<span class="sr-blank active-blank" style="min-width:${minW};">${'_'.repeat(blankLen)}</span>`;
      } else if (entry.status === 'correct') {
        html += `<span class="sr-blank answered-correct" style="min-width:${minW};">${escapeHtml(entry.word)}</span>`;
      } else {
        html += `<span class="sr-blank answered-wrong" style="min-width:${minW};">${escapeHtml(entry.display)}</span>`;
      }
      cursor = entry.end;
    });
    // Remaining text
    html += escapeHtml(text.slice(cursor));

    $('#sr-paragraph-display').html(html);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');
  }

  // Check answer
  $('#sr-check-btn').on('click', checkAnswer);
  $('#sr-answer-input').on('keydown', function (e) {
    if (e.key === 'Enter') checkAnswer();
  });

  function checkAnswer() {
    const userAns   = $('#sr-answer-input').val().trim();
    if (!userAns) { alert('Please type your answer!'); return; }

    const item      = blanksQueue[currentBlank];
    const correct   = userAns.toLowerCase() === item.blankWord.toLowerCase();
    if (correct) score++;

    // Save
    userAnswers.push({
      topicTitle : item.topicTitle,
      word       : item.blankWord,
      yourAnswer : userAns,
      correct    : correct,
      blankStart : item.blankStart,
      blankEnd   : item.blankEnd
    });

    // Disable input
    $('#sr-answer-input').prop('disabled', true);
    $('#sr-check-btn').hide();

    // Show feedback
    const $fb = $('#sr-feedback');
    if (correct) {
      $fb.addClass('correct').html(`
        <span class="po-feedback-icon">✅</span>
        <span class="po-feedback-text"><strong>CORRECT!</strong> The word is <em>"${item.blankWord}"</em>.</span>
      `);
    } else {
      $fb.addClass('wrong').html(`
        <span class="po-feedback-icon">❌</span>
        <span class="po-feedback-text">
          <strong>NOT QUITE.</strong> You wrote: <em>"${userAns}"</em>
          <span class="po-feedback-correct-ans">✔ Correct word: <strong>${item.blankWord}</strong></span>
        </span>
      `);
    }
    $fb.show();

    // Re-render paragraph to show result
    renderParagraph(item);

    const isLast = currentBlank === blanksQueue.length - 1;
    $('#sr-next-btn').text(isLast ? 'SEE RESULTS 🏆' : 'NEXT BLANK ›').show();
  }

  // Next blank
  $('#sr-next-btn').on('click', function () {
    const isLast = currentBlank === blanksQueue.length - 1;
    if (isLast) {
      showScore();
    } else {
      currentBlank++;
      loadBlank();
    }
  });

  // ---- SCORE SCREEN ----
  function showScore() {
    const total = blanksQueue.length;
    const pct   = Math.round((score / total) * 100);

    $('#sr-score-num').text(score);
    $('#sr-score-denom').text('/' + total);

    let msg = '';
    if (pct === 100)    msg = '🎉 PERFECT SCORE! You know it all!';
    else if (pct >= 75) msg = '👏 GREAT WORK! Nearly mastered it!';
    else if (pct >= 50) msg = '💪 GOOD EFFORT! Keep reviewing!';
    else                msg = '📖 KEEP STUDYING! You\'ll nail it!';
    $('#sr-score-msg').text(msg);

    // Review list
    const $review = $('#sr-review-list').empty();
    $.each(userAnswers, function (i, r) {
      const cls  = r.correct ? 'correct' : 'wrong';
      const icon = r.correct ? '✅' : '❌';
      const wrongLine = r.correct ? '' :
        `<div class="po-review-correct-ans">✔ Correct word: <span>${r.word}</span></div>`;
      $review.append(`
        <div class="po-review-item ${cls}">
          <div class="po-review-q">
            <span class="po-review-q-icon">${icon}</span>
            <span>Blank ${i+1}: <em>"${r.word}"</em> — from <strong>${r.topicTitle}</strong></span>
          </div>
          <div class="po-review-your">Your answer: <span>${r.yourAnswer}</span></div>
          ${wrongLine}
        </div>
      `);
    });

    // Progress to 100%
    $('#sr-progress-fill').css('width', '100%');

    // Log to My Learnings
    logSession({
      method      : 'spaced-repetition',
      methodLabel : 'Spaced Repetition',
      methodIcon  : '🃏',
      score       : score,
      total       : blanksQueue.length,
      detail      : `Filled in ${blanksQueue.length} blank${blanksQueue.length !== 1 ? 's' : ''}`,
      savedData   : { topics: $('#sr-topics-list .sr-topic-card').map(function() {
        return {
          title : $(this).find('.sr-title-input').val().trim(),
          para  : $(this).find('.sr-para-input').val().trim()
        };
      }).get() }
    });

    showScreen('sr-screen-score');
  }

  // Retry — same blanks, reshuffled
  $('#sr-retry-btn').on('click', function () {
    blanksQueue = shuffle(blanksQueue);
    startQuiz();
  });

  // Edit topics
  $('#sr-edit-btn').on('click', function () {
    showScreen('sr-screen-setup');
  });
}

// ===== CONTACT PAGE =====
function initContact() {
  $('#contact-back-btn').on('click', function () { goTo('menu.html'); });
}

// ===== ABOUT PAGE =====
function initAbout() {
  $('#about-back-btn').on('click', function () { goTo('menu.html'); });
}

// ===== MY LEARNINGS PAGE =====
function initMyLearnings() {
  $('#ml-back-btn').on('click', function () { goTo('menu.html'); });
  $('#ml-start-studying-btn').on('click', function () { goTo('ready.html'); });

  let currentFilter = 'all';
  let allHistory = getHistory();

  renderStats(allHistory);
  renderList(allHistory, 'all');

  // Filter tabs
  $(document).on('click', '.ml-tab', function () {
    $('.ml-tab').removeClass('active');
    $(this).addClass('active');
    currentFilter = $(this).data('filter');
    renderList(allHistory, currentFilter);
  });

  // Clear all
  $('#ml-clear-all-btn').on('click', function () {
    if (!confirm('Clear all session history? This cannot be undone.')) return;
    sessionStorage.removeItem('urStudBudHistory');
    allHistory = [];
    renderStats(allHistory);
    renderList(allHistory, currentFilter);
    $('#ml-modal-overlay').hide();
  });

  // ---- STATS ----
  function renderStats(history) {
    const sessions = history.length;
    const methodsUsed = new Set(history.map(function(h){ return h.method; })).size;
    const scored = history.filter(function(h){ return h.score !== null && h.total > 0; });
    let avgScore = '—';
    if (scored.length > 0) {
      const avg = scored.reduce(function(sum, h){ return sum + (h.score / h.total * 100); }, 0) / scored.length;
      avgScore = Math.round(avg) + '%';
    }
    $('#ml-stat-sessions').text(sessions);
    $('#ml-stat-methods').text(methodsUsed);
    $('#ml-stat-score').text(avgScore);
  }

  // ---- RENDER CARDS ----
  function renderList(history, filter) {
    const $list = $('#ml-history-list').empty();
    const filtered = filter === 'all' ? history : history.filter(function(h){ return h.method === filter; });

    if (filtered.length === 0) {
      $('#ml-empty').show();
      $('#ml-clear-wrap').hide();
    } else {
      $('#ml-empty').hide();
      $('#ml-clear-wrap').show();
      $.each(filtered, function(i, h) {
        const hasScore = h.score !== null && h.total > 0;
        const pct = hasScore ? Math.round(h.score / h.total * 100) : null;
        let badgeClass = '';
        if (pct !== null) badgeClass = pct === 100 ? 'perfect' : pct >= 60 ? 'good' : 'low';
        const scoreBadge = hasScore
          ? `<span class="ml-card-score-badge ${badgeClass}">${h.score}/${h.total} (${pct}%)</span>` : '';
        const detailLine = h.detail ? `<div class="ml-card-detail">${h.detail}</div>` : '';
        const notesLine  = h.notes  ? `<div class="ml-card-notes">📝 ${h.notes}</div>` : '';
        const hasData    = h.savedData !== null;
        const clickHint  = hasData ? '<span class="ml-card-click-hint">TAP TO OPEN ›</span>' : '';

        $list.append(`
          <div class="ml-history-card ${hasData ? 'ml-card-clickable' : ''}" data-id="${h.id}">
            <div class="ml-card-top">
              <div class="ml-card-method">
                <span class="ml-card-icon">${h.icon}</span>
                <span class="ml-card-name">${h.label}</span>
              </div>
              <div class="ml-card-top-right">
                ${clickHint}
                <span class="ml-card-date">${h.date}</span>
              </div>
            </div>
            ${scoreBadge ? `<div>${scoreBadge}</div>` : ''}
            ${detailLine}
            ${notesLine}
          </div>
        `);
      });
    }
  }

  // ---- CLICK CARD → OPEN MODAL ----
  $(document).on('click', '.ml-card-clickable', function () {
    const id = parseInt($(this).data('id'));
    const session = getSessionById(id);
    if (!session || !session.savedData) return;
    openSessionModal(session);
  });

  function openSessionModal(session) {
    const $overlay = $('#ml-modal-overlay');
    const $title   = $('#ml-modal-title');
    const $body    = $('#ml-modal-body');

    $title.html(`${session.icon} ${session.label} <span class="ml-modal-date">${session.date}</span>`);

    let bodyHtml = '';
    const d = session.savedData;

    if (session.method === 'practice-oriented' && d.questions) {
      const hasScore = session.score !== null;
      if (hasScore) {
        const pct = Math.round(session.score / session.total * 100);
        bodyHtml += `<div class="ml-modal-score-row"><span class="ml-modal-score-circle">${session.score}/${session.total}</span><span class="ml-modal-score-pct">${pct}%</span></div>`;
      }
      bodyHtml += `<div class="ml-modal-section-title">YOUR QUESTIONS (${d.questions.length})</div>`;
      d.questions.forEach(function(q, i) {
        bodyHtml += `
          <div class="ml-modal-qa-card">
            <div class="ml-modal-qa-q"><span class="ml-modal-qa-num">Q${i+1}</span> ${q.q}</div>
            <div class="ml-modal-qa-a">✔ ${q.a}</div>
          </div>`;
      });
      bodyHtml += `<button class="ml-modal-retry-btn" id="ml-retry-po">↺ RETRY THESE QUESTIONS</button>`;

    } else if (session.method === 'spaced-repetition' && d.topics) {
      const hasScore = session.score !== null;
      if (hasScore) {
        const pct = Math.round(session.score / session.total * 100);
        bodyHtml += `<div class="ml-modal-score-row"><span class="ml-modal-score-circle">${session.score}/${session.total}</span><span class="ml-modal-score-pct">${pct}%</span></div>`;
      }
      bodyHtml += `<div class="ml-modal-section-title">YOUR TOPICS (${d.topics.length})</div>`;
      d.topics.forEach(function(t, i) {
        bodyHtml += `
          <div class="ml-modal-topic-card">
            <div class="ml-modal-topic-title">📂 ${t.title || 'Topic ' + (i+1)}</div>
            <div class="ml-modal-topic-para">${t.para}</div>
          </div>`;
      });
      bodyHtml += `<button class="ml-modal-retry-btn" id="ml-retry-sr">↺ RETRY WITH THESE TOPICS</button>`;

    } else if (session.method === 'focused-session') {
      if (d.goal)       bodyHtml += `<div class="ml-modal-fs-row"><span class="ml-modal-fs-label">🎯 GOAL</span><span>${d.goal}</span></div>`;
      if (d.plan)       bodyHtml += `<div class="ml-modal-fs-row"><span class="ml-modal-fs-label">📋 PLAN</span><span>${d.plan}</span></div>`;
      if (d.studyNotes) bodyHtml += `<div class="ml-modal-fs-row"><span class="ml-modal-fs-label">📚 NOTES</span><span>${d.studyNotes}</span></div>`;
      if (d.recap)      bodyHtml += `<div class="ml-modal-fs-row"><span class="ml-modal-fs-label">📝 RECAP</span><span>${d.recap}</span></div>`;
      if (d.studyMinutes) bodyHtml += `<div class="ml-modal-fs-row"><span class="ml-modal-fs-label">⏱ TIMER</span><span>${d.studyMinutes} minutes</span></div>`;
      bodyHtml += `<button class="ml-modal-retry-btn" id="ml-retry-fs">▶ START A NEW SESSION</button>`;

    } else if (session.method === 'reading-writing') {
      if (d.learnings) bodyHtml += `<div class="ml-modal-fs-row"><span class="ml-modal-fs-label">📝 YOUR LEARNINGS</span><span>${d.learnings}</span></div>`;
    }

    $body.html(bodyHtml);
    $overlay.show();

    // Retry buttons
    $('#ml-retry-po').on('click', function () {
      sessionStorage.setItem('ml_restore_po', JSON.stringify(d.questions));
      $overlay.hide();
      goTo('practice-oriented.html');
    });
    $('#ml-retry-sr').on('click', function () {
      sessionStorage.setItem('ml_restore_sr', JSON.stringify(d.topics));
      $overlay.hide();
      goTo('spaced-repetition.html');
    });
    $('#ml-retry-fs').on('click', function () {
      sessionStorage.setItem('ml_restore_fs', JSON.stringify(d));
      $overlay.hide();
      goTo('focused-session.html');
    });
  }

  // Close modal
  $('#ml-modal-close, #ml-modal-overlay').on('click', function (e) {
    if (e.target === this) $('#ml-modal-overlay').hide();
  });
}

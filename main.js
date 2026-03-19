// CTA Study Planner - Adaptive Curriculum Logic
const CURRICULUM_DATA = {
    "재무회계": [
        "2장 수익: 갱신선택권 ~", "3장 건설계약", "4장 현금흐름표", "5장 재고자산과 농림어업",
        "6장 유형자산", "7장 차입원가", "8장 무형자산", "9장 금융부채", "10장 충당부채와 보고기간후사건",
        "11장 자본", "12장 금융자산(1): 지분상품과 채무상품", "13장 금융자산(2): 현금 및 수취채권",
        "14장 복합금융상품", "15장 주식기준보상", "16장 리스", "17장 법인세회계", "18장 주당이익", "19장 회계변경과 오류수정"
    ],
    "세법": [
        "법인세 Chapter 5: 손금(1) - 5.4 과다경비 및 업무무관비용 ~", "법인세 Chapter 6: 손금(2) - 접대비/기부금",
        "법인세 Chapter 7: 손금(3) - 감가상각비", "법인세 Chapter 8: 손금(4) - 지급이자",
        "법인세 Chapter 9: 손익의 귀속시기", "법인세 Chapter 10: 자산의 취득과 평가",
        "법인세 Chapter 11-13: 충당금과 준비금", "법인세 Chapter 14: 부당행위계산의 부인",
        "법인세 Chapter 15-16: 과세표준과 세액/신고납부", "국세기본법: 총칙/국세부과의 원칙",
        "국세기본법: 납세의무/확장/과세", "국세기본법: 국세환급금/불복제도",
        "소득세: 총설/이자·배당소득", "소득세: 사업소득", "소득세: 근로·연금·기타소득/소득금액특례",
        "소득세: 과세표준/세액계산/퇴직/양도소득/신고납부", "부가가치세: 총설/과세거래",
        "부가가치세: 영세율과 면세/세금계산서", "부가가치세: 과세표준과 세액계산",
        "부가가치세: 신고와 납부/간이과세"
    ],
    "원가회계": [
        "Chapter 7: 공손품회계 ~", "Chapter 8: 연산품과 부산물", "Chapter 9: 전부/변동/초변동원가계산",
        "Chapter 10: 활동기준원가계산(ABC)", "Chapter 11-12: 원가추정/CVP분석",
        "Chapter 13-14: 관련원가분석/자본예산", "Chapter 16: 종합예산",
        "Chapter 17-18: 표준원가계산", "Chapter 19-21: 성과평가/대체가격결정",
        "Chapter 22-24: 전략적 원가관리/BSC"
    ],
    "재정학": [
        "제2편 외부성/공공재/공공선택: 핵심문제 18번 ~", "제3편 공공지출이론/비용편익분석",
        "제4편 조세의 기초/전가와 귀착", "제5편 조세의 초과부담/최적과세론",
        "제6편 개별조세이론/조세의 경제적 효과", "제7편 소득분배/사회보장/공공요금",
        "제7편 공채론/지방재정"
    ]
};

// State Management
let state = {
    tasks: JSON.parse(localStorage.getItem('cta_tasks')) || [],
    settings: JSON.parse(localStorage.getItem('cta_settings')) || {
        startTime: "10:30",
        endTime: "17:00",
        breakTime: 1.5,
        apiKey: ""
    },
    selectedDate: new Date().toISOString().split('T')[0]
};

// DOM Elements
const elements = {
    dateInput: document.getElementById('selected-date'),
    taskList: document.getElementById('task-list'),
    progressBar: document.getElementById('daily-progress-bar'),
    percentageText: document.getElementById('daily-percentage'),
    remainingTime: document.getElementById('remaining-time'),
    aiFeedback: document.getElementById('ai-feedback'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    viewContents: document.querySelectorAll('.view-content'),
    addTaskForm: document.getElementById('add-task-form'),
    startTime: document.getElementById('start-time'),
    endTime: document.getElementById('end-time'),
    breakTime: document.getElementById('break-time'),
    apiKey: document.getElementById('api-key'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    resetCurriculumBtn: document.getElementById('reset-curriculum-btn'),
    
    // Chat Elements
    chatWidget: document.getElementById('chat-widget'),
    chatBody: document.getElementById('chat-body'),
    chatInput: document.getElementById('chat-input')
};

function init() {
    if (state.tasks.length === 0) {
        generateInitialPlan();
    }
    loadSettingsUI();
    setupEventListeners();
    renderDailyView();
    updateGlobalProgress();
}

function loadSettingsUI() {
    elements.startTime.value = state.settings.startTime;
    elements.endTime.value = state.settings.endTime;
    elements.breakTime.value = state.settings.breakTime;
    elements.apiKey.value = state.settings.apiKey || "";
}

// 1. Plan Generation Logic (Alternating: Tax Day vs Finance Day)
function generateInitialPlan(startDateStr = null) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    let taskPool = [];
    
    let subjectIndices = { "재무회계": 0, "세법": 0, "원가회계": 0, "재정학": 0 };
    let datePointer = new Date(startDate);
    
    let dayCounter = 0;
    let finished = false;

    // Daily study time is 5 hours total (10:30~17:00 minus 1.5h lunch)
    const MAIN_SUBJECT_TIME = 210; // 3.5 hours
    const MINOR_SUBJECT_TIME = 90;  // 1.5 hours

    while (!finished) {
        // Skip weekends
        while (datePointer.getDay() === 0 || datePointer.getDay() === 6) {
            datePointer.setDate(datePointer.getDate() + 1);
        }

        const dateStr = datePointer.toISOString().split('T')[0];
        
        // Alternating logic:
        // Day 0, 2, 4... : Tax Day (세법 + 재정학)
        // Day 1, 3, 5... : Finance Day (재무회계 + 원가회계)
        let mainSub, minorSub;
        if (dayCounter % 2 === 0) {
            mainSub = "세법";
            minorSub = "재정학";
        } else {
            mainSub = "재무회계";
            minorSub = "원가회계";
        }

        // Add main subject
        if (subjectIndices[mainSub] < CURRICULUM_DATA[mainSub].length) {
            taskPool.push({
                id: `plan-${mainSub}-${subjectIndices[mainSub]}`,
                date: dateStr,
                title: CURRICULUM_DATA[mainSub][subjectIndices[mainSub]],
                subject: mainSub,
                time: MAIN_SUBJECT_TIME,
                completed: false,
                type: 'curriculum',
                order: dayCounter * 10
            });
            subjectIndices[mainSub]++;
        }

        // Add minor subject
        if (subjectIndices[minorSub] < CURRICULUM_DATA[minorSub].length) {
            taskPool.push({
                id: `plan-${minorSub}-${subjectIndices[minorSub]}`,
                date: dateStr,
                title: CURRICULUM_DATA[minorSub][subjectIndices[minorSub]],
                subject: minorSub,
                time: MINOR_SUBJECT_TIME,
                completed: false,
                type: 'curriculum',
                order: dayCounter * 10 + 1
            });
            subjectIndices[minorSub]++;
        }

        dayCounter++;
        datePointer.setDate(datePointer.getDate() + 1);

        // Check if all curriculum finished
        finished = Object.keys(CURRICULUM_DATA).every(sub => subjectIndices[sub] >= CURRICULUM_DATA[sub].length);
        if (dayCounter > 200) break; // Safety break
    }
    
    state.tasks = taskPool;
    saveState();
}

// 2. Adaptive Logic (Adjust from today or selected date)
function adjustFuturePlan(fromToday = true) {
    const startFrom = fromToday ? new Date().toISOString().split('T')[0] : state.selectedDate;
    
    // Sort uncompleted tasks by their original "Day counter" and "Day order"
    const uncompleted = state.tasks.filter(t => !t.completed).sort((a, b) => a.order - b.order);
    
    if (uncompleted.length === 0) return;

    let currentProcessingDate = new Date(startFrom);
    
    // Group tasks by their original "day" type (those with same Math.floor(order/10))
    const uniqueDayGroups = [...new Set(uncompleted.map(t => Math.floor(t.order / 10)))].sort((a,b)=>a-b);
    
    uniqueDayGroups.forEach(dayGroup => {
         while (currentProcessingDate.getDay() === 0 || currentProcessingDate.getDay() === 6) {
            currentProcessingDate.setDate(currentProcessingDate.getDate() + 1);
        }
        
        const newDateStr = currentProcessingDate.toISOString().split('T')[0];
        uncompleted.filter(t => Math.floor(t.order / 10) === dayGroup).forEach(t => {
            t.date = newDateStr;
        });
        
        currentProcessingDate.setDate(currentProcessingDate.getDate() + 1);
    });

    saveState();
    renderDailyView();
}

// UI & Interaction
function setupEventListeners() {
    elements.dateInput.value = state.selectedDate;
    elements.dateInput.addEventListener('change', (e) => {
        state.selectedDate = e.target.value;
        renderDailyView();
    });

    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    elements.addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const subject = document.getElementById('task-subject').value;
        const time = parseInt(document.getElementById('task-time').value);
        
        state.tasks.push({
            id: Date.now().toString(),
            date: state.selectedDate,
            title, subject, time,
            completed: false,
            type: 'manual',
            order: 9999
        });
        saveState();
        renderDailyView();
        elements.addTaskForm.reset();
    });

    elements.saveSettingsBtn.addEventListener('click', () => {
        state.settings = {
            startTime: elements.startTime.value,
            endTime: elements.endTime.value,
            breakTime: parseFloat(elements.breakTime.value),
            apiKey: elements.apiKey.value
        };
        localStorage.setItem('cta_settings', JSON.stringify(state.settings));
        alert("설정이 저장되었습니다. 가용 시간이 업데이트됩니다.");
        renderDailyView();
    });

    elements.resetCurriculumBtn.addEventListener('click', () => {
        if (confirm("모든 진도 데이터를 삭제하고 새로 생성하시겠습니까?")) {
            generateInitialPlan();
            renderDailyView();
            updateGlobalProgress();
        }
    });

    document.getElementById('add-review-task').addEventListener('click', () => {
        const completed = state.tasks.filter(t => t.completed);
        if (completed.length > 0) {
            const random = completed[Math.floor(Math.random() * completed.length)];
            state.tasks.push({
                id: `rev-${Date.now()}`,
                date: state.selectedDate,
                title: `[누적복습] ${random.title}`,
                subject: random.subject,
                time: 60,
                completed: false,
                type: 'review',
                order: 8888
            });
            saveState();
            renderDailyView();
        }
    });

    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function toggleChat() {
    elements.chatWidget.classList.toggle('open');
    if (elements.chatWidget.classList.contains('open')) {
        elements.chatInput.focus();
    }
}

function addChatMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.textContent = text;
    elements.chatBody.appendChild(div);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
}

async function sendMessage() {
    const text = elements.chatInput.value.trim();
    if (!text) return;

    addChatMessage(text, 'user');
    elements.chatInput.value = '';

    const lowerText = text.toLowerCase();
    const isModification = /수정|조정|늦었어|밀렸어|다시|change|update|late/.test(lowerText);

    if (state.settings.apiKey && state.settings.apiKey.length > 10) {
        addChatMessage("AI가 생각 중입니다...", 'bot');
        try {
            const response = await callGeminiAPI(text);
            elements.chatBody.removeChild(elements.chatBody.lastChild);
            
            if (response.action === 'adjust') {
                adjustFuturePlan(true);
                addChatMessage(response.message || "네, 오늘부터 일정을 다시 조정해드렸어요. 화이팅하세요!", 'bot');
            } else {
                addChatMessage(response.message || "네, 무슨 말씀인지 이해했습니다. 공부 화이팅하세요!", 'bot');
            }
        } catch (e) {
            elements.chatBody.removeChild(elements.chatBody.lastChild);
            addChatMessage("오류가 발생했습니다. API Key를 확인해주세요.", 'bot');
        }
    } else {
        setTimeout(() => {
            if (isModification) {
                adjustFuturePlan(true);
                addChatMessage("네, 알겠습니다! 📅 오늘부터 일정을 격일제로 깔끔하게 다시 배치했어요. (하루 세법/재정학, 하루 재무/원가)", 'bot');
            } else if (text.includes("안녕")) {
                addChatMessage("안녕하세요! 오늘도 합격을 위해 달려봅시다. 🔥", 'bot');
            } else {
                addChatMessage("제가 이해하기 어려운 말이네요. '진도 수정해줘'라고 하면 일정을 조정해드릴게요!", 'bot');
            }
        }, 800);
    }
}

async function callGeminiAPI(userText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${state.settings.apiKey}`;
    const prompt = `
    You are a friendly Study Coach for a CTA student.
    User says: "${userText}"
    If the user wants to adjust/modify the schedule or says they are late, return JSON: {"action": "adjust", "message": "friendly confirmation message in Korean"}.
    Otherwise return JSON: {"action": "none", "message": "friendly chat reply in Korean"}.
    Only return valid JSON.
    `;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
}

function renderDailyView() {
    elements.taskList.innerHTML = '';
    const dayTasks = state.tasks.filter(t => t.date === state.selectedDate);
    
    if (dayTasks.length === 0) {
        elements.taskList.innerHTML = '<li class="task-item" style="justify-content:center; color:#999;">계획된 일정이 없습니다.</li>';
    }

    dayTasks.sort((a, b) => a.order - b.order).forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-checkbox" onclick="toggleTask('${task.id}')"></div>
            <div class="task-info">
                <span class="task-title">${task.title}</span>
                <div class="task-meta">
                    <span class="subject-tag subject-${task.subject}">${task.subject}</span> | 
                    <span><i class="far fa-clock"></i> ${task.time / 60}시간</span>
                </div>
            </div>
            <i class="fas fa-trash-alt" style="color:#e74c3c; cursor:pointer;" onclick="deleteTask('${task.id}')"></i>
        `;
        elements.taskList.appendChild(li);
    });

    updateDailyStats();
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveState();
        renderDailyView();
        updateGlobalProgress();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    renderDailyView();
    updateGlobalProgress();
}

function updateDailyStats() {
    const dayTasks = state.tasks.filter(t => t.date === state.selectedDate);
    const completed = dayTasks.filter(t => t.completed);
    const percent = dayTasks.length > 0 ? Math.round((completed.length / dayTasks.length) * 100) : 0;
    
    elements.progressBar.style.width = `${percent}%`;
    elements.percentageText.textContent = `${percent}%`;

    const start = state.settings.startTime.split(':');
    const end = state.settings.endTime.split(':');
    const startMin = parseInt(start[0]) * 60 + parseInt(start[1]);
    const endMin = parseInt(end[0]) * 60 + parseInt(end[1]);
    const totalAvailableMin = (endMin - startMin) - (state.settings.breakTime * 60);
    
    elements.remainingTime.textContent = `${(totalAvailableMin / 60).toFixed(1)}시간 (점심/휴식 제외)`;
}

function switchView(viewName) {
    elements.tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    elements.viewContents.forEach(content => content.classList.toggle('active', content.id === `${viewName}-view`));
    if (viewName === 'weekly') renderWeeklyView();
}

function renderWeeklyView() {
    const container = document.getElementById('weekly-goals');
    container.innerHTML = '';
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        const dayTasks = state.tasks.filter(t => t.date === dStr);
        if (dayTasks.length > 0 || (d.getDay() !== 0 && d.getDay() !== 6)) {
            const completed = dayTasks.filter(t => t.completed).length;
            const item = document.createElement('div');
            item.className = 'goal-item';
            const dayName = ['일','월','화','수','목','금','토'][d.getDay()];
            item.innerHTML = `
                <div class="goal-info">
                    <h4>${d.getMonth()+1}/${d.getDate()} (${dayName})</h4>
                    <p>${dayTasks.length > 0 ? dayTasks.map(t => `<span class="tiny-tag">${t.subject}</span> ${t.title}`).join('<br>') : '자율학습'}</p>
                </div>
                <div class="goal-progress">${completed}/${dayTasks.length}</div>
            `;
            container.appendChild(item);
        }
    }
}

function generateAIFeedback() {
    const today = new Date().toISOString().split('T')[0];
    const unfinished = state.tasks.filter(t => t.date < today && !t.completed);
    let feedback = "";
    if (unfinished.length > 0) {
        feedback = "진도가 조금 밀렸네요! 우측 하단 AI 코치에게 '진도 수정해줘'라고 말하면 오늘부터 다시 격일제로 일정을 짜드릴게요.";
    } else {
        feedback = "훌륭합니다! 현재 세법/재무회계를 격일로 공부하는 플랜이 아주 잘 진행되고 있어요.";
    }
    elements.aiFeedback.textContent = feedback;
}

function saveState() {
    localStorage.setItem('cta_tasks', JSON.stringify(state.tasks));
}

function updateGlobalProgress() {
    const total = state.tasks.filter(t => t.type === 'curriculum').length;
    const completed = state.tasks.filter(t => t.type === 'curriculum' && t.completed).length;
    const overallPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('exam-countdown').textContent = `전체 진도: ${overallPercent}% | 목표 합격!`;
}

window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.toggleChat = toggleChat;
window.sendMessage = sendMessage;

init();

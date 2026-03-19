
const CURRICULUM_DATA = {
    "재무회계": [
        { title: "2장 수익", weight: 1.2 },
        { title: "3장 건설계약", weight: 1.0 },
        { title: "4장 현금흐름표", weight: 1.5 },
        { title: "5장 재고자산과 농림어업", weight: 1.2 },
        { title: "6장 유형자산", weight: 1.3 },
        { title: "7장 차입원가", weight: 0.8 },
        { title: "8장 무형자산", weight: 1.0 },
        { title: "9장 금융부채", weight: 1.5 },
        { title: "10장 충당부채와 보고기간후사건", weight: 1.2 },
        { title: "11장 자본", weight: 1.3 },
        { title: "12장 금융자산(지분/채무)", weight: 2.0 },
        { title: "13장 금융자산(현금/수취채권)", weight: 1.0 },
        { title: "14장 복합금융상품", weight: 1.4 },
        { title: "15장 주식기준보상", weight: 1.2 },
        { title: "16장 리스", weight: 1.6 },
        { title: "17장 법인세회계", weight: 1.8 },
        { title: "18장 주당이익", weight: 1.3 },
        { title: "19장 회계변경과 오류수정", weight: 1.0 }
    ],
    "세법": [
        { title: "법인세 5장 손금", weight: 1.5 },
        { title: "6장 접대비/기부금", weight: 1.2 },
        { title: "7장 감가상각비", weight: 1.3 },
        { title: "8장 지급이자", weight: 1.2 },
        { title: "9장 손익의 귀속시기", weight: 1.0 },
        { title: "10장 자산의 취득과 평가", weight: 1.2 },
        { title: "11-13장 충당금과 준비금", weight: 1.5 },
        { title: "14장 부당행위계산의 부인", weight: 1.8 },
        { title: "15-16장 과세표준과 세액", weight: 1.5 },
        { title: "국기법 총칙/국세부과", weight: 1.0 },
        { title: "국기법 납세의무/확장/과세", weight: 1.2 },
        { title: "국기법 국세환급금/불복제도", weight: 0.8 },
        { title: "소득세 총설/이자·배당", weight: 1.0 },
        { title: "소득세 사업소득", weight: 1.5 },
        { title: "소득세 근로·연금·기타소득", weight: 1.2 },
        { title: "소득세 과세표준/세액계산", weight: 1.3 },
        { title: "소득세 퇴직/양도소득/신고납부", weight: 1.4 },
        { title: "부가세 총설/과세거래", weight: 1.0 },
        { title: "부가세 영세율과 면세/세금계산서", weight: 1.2 },
        { title: "부가세 과세표준과 세액계산", weight: 1.5 },
        { title: "부가세 신고와 납부/간이과세", weight: 1.3 }
    ],
    "원가회계": [
        { title: "7장 공손품회계", weight: 1.2 },
        { title: "8장 연산품과 부산물", weight: 1.0 },
        { title: "9장 전부/변동/초변동원가계산", weight: 1.5 },
        { title: "10장 활동기준원가계산(ABC)", weight: 1.3 },
        { title: "11-12장 원가추정/CVP분석", weight: 1.8 },
        { title: "13-14장 관련원가분석/자본예산", weight: 1.8 },
        { title: "16장 종합예산", weight: 1.0 },
        { title: "17-18장 표준원가계산", weight: 2.0 },
        { title: "19-21장 성과평가/대체가격결정", weight: 1.5 },
        { title: "22-24장 전략적 원가관리", weight: 0.8 }
    ],
    "재정학": [
        { title: "2편 후생경제학(외부성/공공재)", weight: 1.5 },
        { title: "3편 공공지출/비용편익분석", weight: 1.2 },
        { title: "4편 조세의 전가와 귀착", weight: 1.8 },
        { title: "5편 조세의 초과부담/최적과세론", weight: 1.5 },
        { title: "6편 개별조세의 경제적 효과", weight: 1.3 },
        { title: "7편 소득분배/사회보장", weight: 1.0 },
        { title: "7편 공채론/지방재정", weight: 0.8 }
    ]
};

const REVIEW_INTERVALS = [1, 3, 7, 14, 30];

let state = {
    tasks: [],
    settings: { startTime: "09:00", endTime: "22:00", breakTime: 2 },
    selectedDate: new Date().toISOString().split('T')[0],
    currentTaskToComplete: null
};

const elements = {
    dateInput: document.getElementById('selected-date'),
    taskList: document.getElementById('task-list'),
    progressBar: document.getElementById('daily-progress-bar'),
    percentageText: document.getElementById('daily-percentage'),
    remainingTime: document.getElementById('remaining-time'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    viewContents: document.querySelectorAll('.view-content'),
    addTaskForm: document.getElementById('add-task-form'),
    startTime: document.getElementById('start-time'),
    endTime: document.getElementById('end-time'),
    breakTime: document.getElementById('break-time'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    resetCurriculumBtn: document.getElementById('reset-curriculum-btn'),
    skipDayBtn: document.getElementById('skip-day-btn'),
    chatWidget: document.getElementById('chat-widget'),
    chatBody: document.getElementById('chat-body'),
    chatInput: document.getElementById('chat-input'),
    modal: document.getElementById('completion-modal'),
    completeFullBtn: document.getElementById('complete-full-btn'),
    completeSplitBtn: document.getElementById('complete-split-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn')
};

function init() {
    loadState();
    loadSettingsUI();
    setupEventListeners();
    if (state.tasks.length === 0) {
        generateInitialPlan();
    }
    renderDailyView();
    updateGlobalProgress();
}

function loadState() {
    const savedTasks = localStorage.getItem('cta_tasks');
    const savedSettings = localStorage.getItem('cta_settings');
    if (savedTasks) {
        state.tasks = JSON.parse(savedTasks);
    }
    if (savedSettings) {
        state.settings = JSON.parse(savedSettings);
    }
}

function saveState() {
    localStorage.setItem('cta_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('cta_settings', JSON.stringify(state.settings));
}

function loadSettingsUI() {
    elements.startTime.value = state.settings.startTime;
    elements.endTime.value = state.settings.endTime;
    elements.breakTime.value = state.settings.breakTime;
}

function getStudyTimePerDay(dateStr, fromTime = null) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const effectiveStartTime = fromTime || state.settings.startTime;
    const start = effectiveStartTime.split(':').map(Number);
    const end = state.settings.endTime.split(':').map(Number);
    
    let startMins = start[0] * 60 + start[1];
    const endMins = end[0] * 60 + end[1];

    if (dateStr === todayStr) {
        const nowMins = now.getHours() * 60 + now.getMinutes();
        startMins = Math.max(startMins, nowMins);
    }

    const totalDuration = endMins - startMins;
    
    const scheduledDuration = (parseInt(state.settings.endTime.split(':')[0], 10)*60 + parseInt(state.settings.endTime.split(':')[1], 10)) - 
                              (parseInt(state.settings.startTime.split(':')[0], 10)*60 + parseInt(state.settings.startTime.split(':')[1], 10));
    
    const breakProportion = scheduledDuration > 0 ? totalDuration / scheduledDuration : 1;
    const adjustedBreakTime = state.settings.breakTime * 60 * breakProportion;

    return totalDuration > 0 ? Math.round(Math.max(0, totalDuration - adjustedBreakTime)) : 0;
}

function generateInitialPlan(startDateStr = null) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date();
    let taskPool = [];
    const subjectTasks = {};
    for (const subject in CURRICULUM_DATA) {
        subjectTasks[subject] = [...CURRICULUM_DATA[subject]];
    }

    let datePointer = new Date(startDate);
    let dayCounter = 0;
    const subjectPattern = [ ["재무회계", "재정학"], ["세법", "원가회계"] ];
    const baseWeightToTime = 100;

    while (Object.values(subjectTasks).some(tasks => tasks.length > 0)) {
        if (datePointer.getDay() === 0 || datePointer.getDay() === 6) { 
            datePointer.setDate(datePointer.getDate() + 1);
            continue;
        }
        const dateStr = datePointer.toISOString().split('T')[0];
        const dailyTimeBudget = getStudyTimePerDay(dateStr);
        const [mainSub, minorSub] = subjectPattern[dayCounter % 2];
        let dailyTimeSpent = 0;
        let orderInDay = 0;

        while (subjectTasks[mainSub].length > 0 && (dailyTimeSpent / dailyTimeBudget) < 0.65) {
            const task = subjectTasks[mainSub][0]; 
            const taskTime = task.weight * baseWeightToTime;
            if (dailyTimeSpent + taskTime > dailyTimeBudget * 1.2) break;
            subjectTasks[mainSub].shift();
            dailyTimeSpent += taskTime;
            taskPool.push(createTask(dateStr, mainSub, task.title, taskTime, 'curriculum', dayCounter * 10 + orderInDay++));
        }

        while (subjectTasks[minorSub] && subjectTasks[minorSub].length > 0) {
            const task = subjectTasks[minorSub][0]; 
            const taskTime = task.weight * baseWeightToTime;
            if (dailyTimeSpent + taskTime > dailyTimeBudget * 1.2) break;
            subjectTasks[minorSub].shift();
            dailyTimeSpent += taskTime;
            taskPool.push(createTask(dateStr, minorSub, task.title, taskTime, 'curriculum', dayCounter * 10 + orderInDay++));
        }

        const tasksOnDate = taskPool.filter(t => t.date === dateStr);
        const totalWeightOnDate = tasksOnDate.reduce((sum, t) => sum + getTaskWeight(t), 0);
        if (totalWeightOnDate > 0) {
            tasksOnDate.forEach(task => {
                const weight = getTaskWeight(task);
                task.time = Math.round((dailyTimeBudget * (weight / totalWeightOnDate)) / 5) * 5;
            });
        }

        dayCounter++;
        datePointer.setDate(datePointer.getDate() + 1);
        if (dayCounter > 500) break; 
    }

    state.tasks = taskPool;
    saveState();
}


function createTask(date, subject, title, time, type, order, originalId = null) {
    return {
        id: type === 'review' ? `rev-${originalId}-${Date.now()}` : `task-${Date.now()}-${Math.random()}`,
        date,
        title,
        subject,
        time,
        completed: false,
        type, 
        order, 
        originalTaskId: originalId
    };
}

function scheduleReviewTasks(completedTask) {
    if (completedTask.type !== 'curriculum') return;
    const completionDate = new Date(state.selectedDate);
    REVIEW_INTERVALS.forEach(interval => {
        const reviewDate = getNextWorkday(completionDate, interval-1);
        const reviewDateStr = reviewDate.toISOString().split('T')[0];
        const reviewTitle = `${completedTask.title.replace(/ \(1\/2\)$/, '')}`;
        
        const existingReview = state.tasks.find(t => t.type === 'review' && t.originalTaskId === completedTask.id && t.date === reviewDateStr);

        if (!existingReview) {
             state.tasks.push(createTask(reviewDateStr, completedTask.subject, reviewTitle, 30, 'review', 9000 + interval, completedTask.id));
        }
    });
}

const getTaskWeight = (task) => {
    const title = task.title.replace(/ \(1\/2\)$/, '').replace(/ \(2\/2\)$/, '');
    const item = CURRICULUM_DATA[task.subject]?.find(d => d.title === title);
    let weight = item?.weight || 1;
    if (task.title.includes('(1/2)') || task.title.includes('(2/2)')) {
        weight /= 2;
    }
    return weight;
};

function getBalancedDailyTasks(date, timeOverride = null) {
    const allDayTasks = state.tasks.filter(t => t.date === date);
    const reviewTasks = allDayTasks.filter(t => t.type === 'review');
    let curriculumTasks = allDayTasks.filter(t => t.type === 'curriculum' && !t.completed);
    const manualTasks = allDayTasks.filter(t => t.type === 'manual');

    const totalReviewTime = reviewTasks.reduce((sum, task) => sum + task.time, 0);
    let totalStudyTime = timeOverride !== null ? timeOverride : getStudyTimePerDay(date); 

    let studyTimeForCurriculum = totalStudyTime - totalReviewTime;

    if (studyTimeForCurriculum <= 0) {
        curriculumTasks.forEach(t => t.time = 0);
        return [...reviewTasks, ...manualTasks, ...state.tasks.filter(t => t.date === date && t.completed)];
    }

    const totalWeightOnDate = curriculumTasks.reduce((sum, task) => sum + getTaskWeight(task), 0);

    if (totalWeightOnDate > 0) {
        let allocatedTime = 0;
        curriculumTasks.forEach((task, index) => {
            const weight = getTaskWeight(task);
            let taskTime = 0;
            if (index === curriculumTasks.length - 1) {
                taskTime = studyTimeForCurriculum - allocatedTime;
            } else {
                taskTime = Math.round((studyTimeForCurriculum * (weight / totalWeightOnDate)) / 5) * 5;
                allocatedTime += taskTime;
            }
            task.time = Math.max(0, taskTime);
        });
    }

    return [...curriculumTasks, ...reviewTasks, ...manualTasks, ...state.tasks.filter(t => t.date === date && t.completed)].filter(t => t.time > 0);
}


function adjustFuturePlan(startingFrom) {
    const startDate = new Date(startingFrom);
    const tasksToAdjust = state.tasks.filter(t => new Date(t.date) >= startDate && t.type === 'curriculum');
    const otherTasks = state.tasks.filter(t => new Date(t.date) < startDate || t.type !== 'curriculum');
    
    const sortedTasks = tasksToAdjust.sort((a,b) => new Date(a.date) - new Date(b.date) || a.order - b.order);
    const taskQueue = [...sortedTasks];
    
    let datePointer = new Date(startDate);
    let dayCounter = 0; 

    const adjustedTasks = [];

    while(taskQueue.length > 0) {
        if (datePointer.getDay() === 0 || datePointer.getDay() === 6) {
            datePointer.setDate(datePointer.getDate() + 1);
            continue;
        }
        const dateStr = datePointer.toISOString().split('T')[0];
        const originalDateOfFirstTask = taskQueue[0].date;
        
        const tasksForThisOriginalDay = taskQueue.filter(t => t.date === originalDateOfFirstTask);
        
        tasksForThisOriginalDay.forEach(t => { t.date = dateStr; });
        adjustedTasks.push(...tasksForThisOriginalDay);

        const idsToFilter = new Set(tasksForThisOriginalDay.map(t => t.id));
        for (let i = taskQueue.length - 1; i >= 0; i--) { 
            if (idsToFilter.has(taskQueue[i].id)) {
                taskQueue.splice(i, 1);
            }
        }

        datePointer.setDate(datePointer.getDate() + 1);
        if (dayCounter++ > 500) break;
    }
    
    state.tasks = [...otherTasks, ...adjustedTasks];
    saveState();
}

function handleTimeChange(hour) {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeString = `${String(hour).padStart(2, '0')}:00`;
    let remainingTime = getStudyTimePerDay(todayStr, timeString);
    const scheduledTotalTime = getStudyTimePerDay(todayStr);
    
    let todayTasks = state.tasks.filter(t => t.date === todayStr && t.type === 'curriculum' && !t.completed);

    if (remainingTime < scheduledTotalTime * 0.5 && todayTasks.length > 1) {
        todayTasks.sort((a, b) => getTaskWeight(a) - getTaskWeight(b));
        const taskToMove = todayTasks[0];
        const mainTask = todayTasks[todayTasks.length - 1];

        const tomorrow = getNextWorkday(new Date());
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        taskToMove.date = tomorrowStr;
        taskToMove.order -= 1000; 
        
        adjustFuturePlan(tomorrowStr);
        renderDailyView();
        return `시간이 부족하네요. 오늘은 핵심 과목인 ${mainTask.subject}에 집중하시고, ${taskToMove.subject}은(는) 내일 계획에 추가했습니다.`;
    }
    else if (remainingTime > scheduledTotalTime + 60) {
        const tomorrow = getNextWorkday(new Date());
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const tomorrowsTasks = state.tasks.filter(t => t.date === tomorrowStr && t.type ==='curriculum');
        
        if(tomorrowsTasks.length > 0){
            tomorrowsTasks.sort((a, b) => getTaskWeight(a) - getTaskWeight(b));
            const taskToPull = tomorrowsTasks[0];
            taskToPull.date = todayStr;
            taskToPull.order += 5;
            renderDailyView({ timeOverride: remainingTime });
            return `의지가 넘치시네요! 🔥 시간이 남으니 내일 할 일이었던 ${taskToPull.subject} 일부를 오늘 미리 시작해보는건 어떨까요?`;
        }
    }

    renderDailyView({ timeOverride: remainingTime });
    return `${hour}시에 시작하시는군요! 남은 시간에 맞춰 오늘 학습 시간을 현실적으로 재분배했습니다.`;
}

function getNextWorkday(date, daysToAdd = 1) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + daysToAdd);
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
        nextDay.setDate(nextDay.getDate() + 1);
    }
    return nextDay;
}

function skipDay() {
    const todayStr = new Date().toISOString().split('T')[0];
    const uncompletedTasks = state.tasks.filter(t => t.date === todayStr && t.type === 'curriculum' && !t.completed);

    if (uncompletedTasks.length === 0) {
        addChatMessage("오늘은 모든 계획을 완료하셨거나, 계획이 없습니다!", 'bot');
        return;
    }

    const tomorrow = getNextWorkday(new Date());
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    uncompletedTasks.forEach(task => {
        task.date = tomorrowStr;
        task.order -= 1000; 
    });

    adjustFuturePlan(tomorrowStr);
    renderDailyView();
    addChatMessage(`알겠습니다. 오늘 못하신 과목들을 내일 계획으로 옮기고, 전체 일정을 조정했습니다.`, 'bot');
}

function splitTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.type !== 'curriculum' || task.title.includes('(1/2)') || task.title.includes('(2/2)')) return;

    task.title = `${task.title} (1/2)`;
    task.completed = true;
    scheduleReviewTasks(task);

    const nextDay = getNextWorkday(new Date(task.date));
    const nextDayStr = nextDay.toISOString().split('T')[0];
    
    const weight = getTaskWeight(task) * 2;

    const newTask = createTask(
        nextDayStr, 
        task.subject, 
        `${task.title.replace(' (1/2)', '')} (2/2)`,
        (weight * 100) / 2, 
        'curriculum', 
        task.order - 0.1 
    );
    
    state.tasks.push(newTask);
    adjustFuturePlan(nextDayStr);
}

function setupEventListeners() {
    elements.dateInput.value = state.selectedDate;
    elements.dateInput.addEventListener('change', (e) => {
        state.selectedDate = e.target.value;
        renderDailyView();
    });

    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    if (elements.skipDayBtn) {
        elements.skipDayBtn.addEventListener('click', () => {
            if (confirm("오늘의 미완료 학습을 모두 내일로 넘기고, 전체 계획을 재조정하시겠습니까?")) {
                skipDay();
            }
        });
    }

    elements.addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const subject = document.getElementById('task-subject').value;
        const time = parseInt(document.getElementById('task-time').value);
        state.tasks.push(createTask(state.selectedDate, subject, title, time, 'manual', 9999));
        saveState();
        renderDailyView();
        elements.addTaskForm.reset();
    });

    elements.saveSettingsBtn.addEventListener('click', () => {
        state.settings = {
            startTime: elements.startTime.value,
            endTime: elements.endTime.value,
            breakTime: parseFloat(elements.breakTime.value),
        };
        saveState();
        alert("설정이 저장되었습니다. 새 학습 시간을 적용하려면 '진도 전체 초기화'를 진행해주세요.");
    });

    elements.resetCurriculumBtn.addEventListener('click', () => {
        if (confirm("정말 모든 학습 기록을 삭제하고, 현재 설정에 맞춰 전체 계획을 새로 생성하시겠습니까?")) {
            localStorage.removeItem('cta_tasks');
            state.tasks = [];
            generateInitialPlan();
            renderDailyView();
            updateGlobalProgress();
        }
    });

    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) { 
            e.preventDefault();
            sendMessage();
        }
    });

    elements.modalCancelBtn.addEventListener('click', hideCompletionModal);
    elements.completeFullBtn.addEventListener('click', () => handleCompletion(false));
    elements.completeSplitBtn.addEventListener('click', () => handleCompletion(true));
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) hideCompletionModal();
    });
}

function sendMessage() {
    const text = elements.chatInput.value.trim();
    if (!text) return;
    addChatMessage(text, 'user');
    elements.chatInput.value = '';

    const lowerText = text.toLowerCase();
    const timeMatch = text.match(/(\d{1,2})시/);
    const isStartNow = /(지금|바로)\s*(시작|할게)/.test(lowerText);
    const isSkipDay = /(오늘|하루)\s*(쉴게|건너뛸게|못해)/.test(lowerText);
    const isAdjustmentRequest = /수정|조정|밀렸어|다시/.test(lowerText);

    setTimeout(() => {
        if (timeMatch || isStartNow) {
            const hour = isStartNow ? new Date().getHours() : parseInt(timeMatch[1], 10);
            const message = handleTimeChange(hour);
            addChatMessage(message, 'bot');
        } else if (isSkipDay) {
            skipDay();
        } else if (isAdjustmentRequest) {
            adjustFuturePlan(new Date().toISOString().split('T')[0]);
             addChatMessage("네, 알겠습니다! 📅 오늘부터 밀린 일정을 재배치했습니다. 주간 계획을 확인해보세요.", 'bot');
        } else if (lowerText.includes("안녕")) {
            addChatMessage("안녕하세요! 오늘도 합격을 위해 달려봅시다. 🔥", 'bot');
        } else {
            addChatMessage("제가 이해할 수 있는 말은 '진도 수정', '지금 시작할게', '14시에 시작' 또는 '오늘 하루 쉴게' 입니다.", 'bot');
        }
    }, 500);
}

function addChatMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.textContent = text;
    elements.chatBody.appendChild(div);
    elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
}

function renderDailyView(options = {}) {
    elements.taskList.innerHTML = '';
    const isToday = state.selectedDate === new Date().toISOString().split('T')[0];
    let timeForCalc = options.timeOverride !== undefined ? options.timeOverride : getStudyTimePerDay(state.selectedDate);

    if (dayTasks.length === 0) {
        elements.taskList.innerHTML = '<li class="task-item" style="justify-content:center; color:#999;">계획된 일정이 없습니다.</li>';
    }
    
    const dayTasks = getBalancedDailyTasks(state.selectedDate, timeForCalc);

    dayTasks.sort((a,b) => a.order - b.order).forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item type-${task.type} ${task.completed ? 'completed' : ''}`;
        const checkboxAction = task.completed ? '' : `onclick="showCompletionModal('${task.id}')"`;
        li.innerHTML = `
            <div class="task-checkbox" ${checkboxAction}></div>
            <div class="task-info">
                <span class="task-title">${task.title}</span>
                <div class="task-meta">
                    <span class="subject-tag subject-${task.subject}">${task.subject}</span> | 
                    <span><i class="far fa-clock"></i> ${task.time}분</span>
                </div>
            </div>
            <i class="fas fa-trash-alt" onclick="deleteTask('${task.id}')"></i>
        `;
        elements.taskList.appendChild(li);
    });
    updateDailyStats(timeForCalc, dayTasks);
}

function showCompletionModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    if (task.type !== 'curriculum' || task.title.includes('(1/2)') || task.title.includes('(2/2)')) {
        elements.completeSplitBtn.style.display = 'none';
    } else {
        elements.completeSplitBtn.style.display = 'block';
    }
    state.currentTaskToComplete = taskId;
    elements.modal.classList.add('show');
}

function hideCompletionModal() {
    elements.modal.classList.remove('show');
    state.currentTaskToComplete = null;
}

function handleCompletion(isSplit) {
    const taskId = state.currentTaskToComplete;
    if (!taskId) return;
    const task = state.tasks.find(t => t.id === taskId);
    
    if (isSplit) {
        splitTask(taskId);
    } else {
        if (task) {
            task.completed = true;
            scheduleReviewTasks(task);
        }
    }
    
    hideCompletionModal();
    saveState();
    renderDailyView();
    updateGlobalProgress();
}

function deleteTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if(task && task.completed) {
        state.tasks = state.tasks.filter(t => t.type !== 'review' || t.originalTaskId !== id);
    }
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    renderDailyView();
    updateGlobalProgress();
}

function updateDailyStats(timeForCalc, dayTasks) {
    const tasksToConsider = dayTasks || getBalancedDailyTasks(state.selectedDate, timeForCalc);
    const completedTasks = tasksToConsider.filter(t => t.completed);
    const totalMinutes = tasksToConsider.reduce((sum, t) => sum + t.time, 0);
    const completedMinutes = completedTasks.reduce((sum, t) => sum + t.time, 0);
    
    const percent = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;
    
    elements.progressBar.style.width = `${percent}%`;
    elements.percentageText.textContent = `${percent}%`;
    elements.remainingTime.textContent = `${(totalMinutes / 60).toFixed(1)}시간`;
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
        const d = new Date();
        d.setDate(today.getDate() + i);
        if (d.getDay() === 0 || d.getDay() === 6) continue;

        const dStr = d.toISOString().split('T')[0];
        const dayTasks = getBalancedDailyTasks(dStr);
        const totalMins = dayTasks.reduce((acc, t) => acc + t.time, 0);
        const completedMins = dayTasks.filter(t=>t.completed).reduce((acc, t) => acc + t.time, 0);
        const progress = totalMins > 0 ? Math.round(completedMins/totalMins * 100) : 0;

        const item = document.createElement('div');
        item.className = 'goal-item';
        const dayName = ['일','월','화','수','목','금','토'][d.getDay()];
        item.innerHTML = `
            <div class="goal-info">
                <h4>${d.getMonth()+1}/${d.getDate()} (${dayName})</h4>
                <p>${dayTasks.length > 0 ? dayTasks.map(t => `<span class="tiny-tag type-${t.type} subject-${t.subject}">${t.subject.substring(0,2)}</span> ${t.title}`).join('<br>') : '휴식 또는 자율'}</p>
            </div>
            <div class="goal-progress">${progress}%</div>
        `;
        container.appendChild(item);
    }
}

function updateGlobalProgress() {
    const curriculumTasks = state.tasks.filter(t => t.type === 'curriculum');
    if (curriculumTasks.length === 0) return;

    const totalWeight = CURRICULUM_DATA.재무회계.concat(CURRICULUM_DATA.세법, CURRICULUM_DATA.원가회계, CURRICULUM_DATA.재정학).reduce((sum, item) => sum + item.weight, 0);
    let completedWeight = 0;
    state.tasks.filter(t => t.completed && t.type === 'curriculum').forEach(task => {
        completedWeight += getTaskWeight(task);
    });
    
    const overallPercent = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
    document.getElementById('exam-countdown').textContent = `전체 진도율: ${overallPercent}%`;
}

window.showCompletionModal = showCompletionModal;
window.deleteTask = deleteTask;
window.toggleChat = () => {
    const widget = elements.chatWidget;
    widget.classList.toggle('open');
    if(widget.classList.contains('open')) {
        elements.chatInput.focus();
    }
}
window.sendMessage = sendMessage;

init();

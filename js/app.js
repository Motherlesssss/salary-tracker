// API配置
const API_BASE = 'http://localhost:5000/api';
let currentInternId = null;
let salaryTimer = null;

// 页面切换
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showHomePage() {
    showPage('page-home');
    loadInterns();
}

function showAddInternPage() {
    showPage('page-add-intern');
    document.getElementById('entry-date').valueAsDate = new Date();
}

function showSalaryPage() {
    if (!currentInternId) {
        alert('请先选择实习生');
        showHomePage();
        return;
    }
    showPage('page-salary');
    startRealtimeUpdate();
}

function showLeavePage() {
    showPage('page-leave');
    loadLeaveRecords();
}

function showStatisticsPage() {
    showPage('page-statistics');
    loadStatistics();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 尝试从localStorage恢复上次选择的实习生
    const savedId = localStorage.getItem('currentInternId');
    if (savedId) {
        currentInternId = parseInt(savedId);
    }

    loadInterns();
});

// 加载实习生列表
async function loadInterns() {
    try {
        const response = await fetch(`${API_BASE}/interns?status=active`);
        const result = await response.json();

        if (result.code === 200) {
            const interns = result.data;
            const listEl = document.getElementById('intern-list');
            const emptyEl = document.getElementById('empty-state');

            if (interns.length === 0) {
                listEl.innerHTML = '';
                emptyEl.style.display = 'block';
            } else {
                emptyEl.style.display = 'none';
                listEl.innerHTML = interns.map(intern => `
                    <div class="intern-card" onclick="selectIntern(${intern.id})">
                        <div class="intern-info">
                            <div class="intern-name">${intern.name}</div>
                            <div class="intern-id">工号: ${intern.employee_id}</div>
                            <div class="intern-dept">${intern.department || '未设置部门'}</div>
                        </div>
                        <div class="intern-salary">
                            <div class="salary-label">日薪</div>
                            <div class="salary-amount">¥${intern.daily_salary}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('加载实习生列表失败:', error);
        alert('加载失败，请确保后端服务正在运行');
    }
}

// 选择实习生
function selectIntern(internId) {
    currentInternId = internId;
    localStorage.setItem('currentInternId', internId);
    showSalaryPage();
}

// 提交实习生信息
async function submitIntern() {
    const data = {
        name: document.getElementById('intern-name').value.trim(),
        employee_id: document.getElementById('intern-id').value.trim(),
        daily_salary: parseFloat(document.getElementById('daily-salary').value),
        work_start_time: document.getElementById('work-start').value + ':00',
        work_end_time: document.getElementById('work-end').value + ':00',
        entry_date: document.getElementById('entry-date').value,
        phone: document.getElementById('phone').value.trim() || undefined,
        department: document.getElementById('department').value.trim() || undefined
    };

    // 验证
    if (!data.name) {
        alert('请输入姓名');
        return;
    }
    if (!data.employee_id) {
        alert('请输入工号');
        return;
    }
    if (!data.daily_salary || data.daily_salary <= 0) {
        alert('请输入有效的日薪');
        return;
    }
    if (!data.entry_date) {
        alert('请选择入职日期');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/interns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.code === 200) {
            alert('✅ 添加成功！');
            // 清空表单
            document.getElementById('intern-name').value = '';
            document.getElementById('intern-id').value = '';
            document.getElementById('daily-salary').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('department').value = '';
            // 返回首页
            showHomePage();
        } else {
            alert(result.message || '添加失败');
        }
    } catch (error) {
        console.error('添加实习生失败:', error);
        alert('添加失败，请检查网络连接');
    }
}

// 开始实时更新薪资
function startRealtimeUpdate() {
    // 停止之前的定时器
    if (salaryTimer) {
        clearInterval(salaryTimer);
    }

    // 立即更新一次
    updateSalary();

    // 每秒更新
    salaryTimer = setInterval(updateSalary, 1000);
}

// 停止实时更新
function stopRealtimeUpdate() {
    if (salaryTimer) {
        clearInterval(salaryTimer);
        salaryTimer = null;
    }
}

// 更新薪资数据
async function updateSalary() {
    if (!currentInternId) return;

    try {
        const response = await fetch(`${API_BASE}/salary/realtime?intern_id=${currentInternId}`);
        const result = await response.json();

        if (result.code === 200) {
            const data = result.data;

            // 更新总薪资
            document.getElementById('total-salary').textContent = data.total_salary.toFixed(2);

            // 更新今日收益
            document.getElementById('today-salary').textContent = `¥${data.today_salary.toFixed(2)}`;

            // 更新进度条
            const progress = (data.today_worked_seconds / data.work_seconds_per_day) * 100;
            document.getElementById('today-progress').style.width = `${Math.min(100, progress)}%`;

            // 更新今日工作时间
            document.getElementById('today-worked').textContent = formatSeconds(data.today_worked_seconds);

            // 更新统计数据
            document.getElementById('completed-days').textContent = data.completed_days;
            document.getElementById('leave-days').textContent = data.leave_days;
            document.getElementById('daily-salary-display').textContent = `¥${data.daily_salary}`;
            document.getElementById('salary-per-second').textContent = `¥${data.salary_per_second.toFixed(4)}/秒`;

            // 更新日期
            document.getElementById('current-date').textContent = formatDate(new Date());

            // 更新提示
            updateFunTip(data);
        }
    } catch (error) {
        console.error('更新薪资失败:', error);
    }
}

// 格式化秒数
function formatSeconds(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `已工作 ${hours}小时${minutes}分${secs}秒`;
    } else if (minutes > 0) {
        return `已工作 ${minutes}分${secs}秒`;
    } else {
        return `已工作 ${secs}秒`;
    }
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 更新有趣提示
function updateFunTip(data) {
    const tips = [
        { emoji: '🔥', text: `你已经赚了 ${data.total_salary.toFixed(2)} 元啦！继续加油！` },
        { emoji: '💪', text: `已经工作了 ${data.completed_days} 天，真棒！` },
        { emoji: '🎯', text: `每秒进账 ${data.salary_per_second.toFixed(4)} 元，钱钱滚滚来！` },
        { emoji: '⏰', text: '时间就是金钱，每一秒都在涨薪！' },
        { emoji: '🌈', text: '今天又是充满希望的一天！' },
        { emoji: '🎉', text: '恭喜你，又近了一步财务自由的目标！' },
        { emoji: '💰', text: '钱包正在变鼓，你的努力没有白费！' }
    ];

    let tip;
    if (data.today_worked_seconds > 4 * 3600) {
        tip = { emoji: '🌟', text: '今天已经工作超过4小时了，辛苦啦！' };
    } else if (data.today_worked_seconds > 2 * 3600) {
        tip = { emoji: '💪', text: '加油！已经赚了一半啦！' };
    } else if (data.today_worked_seconds > 0) {
        tip = { emoji: '🔥', text: '开工啦！今天也要元气满满！' };
    } else {
        tip = tips[Math.floor(Math.random() * tips.length)];
    }

    const tipEl = document.getElementById('fun-tip');
    tipEl.innerHTML = `
        <span class="tip-emoji">${tip.emoji}</span>
        <span class="tip-text">${tip.text}</span>
    `;
}

// 加载请假记录
async function loadLeaveRecords() {
    if (!currentInternId) return;

    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

        const response = await fetch(`${API_BASE}/leave?intern_id=${currentInternId}&start_date=${startDate}`);
        const result = await response.json();

        if (result.code === 200) {
            const records = result.data;
            const listEl = document.getElementById('leave-list');
            const emptyEl = document.getElementById('leave-empty');

            if (records.length === 0) {
                listEl.innerHTML = '';
                emptyEl.style.display = 'block';
            } else {
                emptyEl.style.display = 'none';
                listEl.innerHTML = records.map(record => `
                    <div class="record-item">
                        <div class="record-info">
                            <div class="record-date">📅 ${record.leave_date}</div>
                            <div class="record-reason">${record.reason || '无原因'}</div>
                        </div>
                        <div class="delete-btn" onclick="deleteLeave(${record.id})">🗑️</div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('加载请假记录失败:', error);
    }
}

// 添加请假
async function addLeave() {
    if (!currentInternId) return;

    const leaveDate = document.getElementById('leave-date').value;
    const reason = document.getElementById('leave-reason').value.trim();

    if (!leaveDate) {
        alert('请选择请假日期');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                intern_id: currentInternId,
                leave_date: leaveDate,
                reason: reason || undefined
            })
        });

        const result = await response.json();

        if (result.code === 200) {
            alert('✅ 请假记录已添加');
            document.getElementById('leave-date').value = '';
            document.getElementById('leave-reason').value = '';
            loadLeaveRecords();
        } else {
            alert(result.message || '添加失败');
        }
    } catch (error) {
        console.error('添加请假失败:', error);
        alert('添加失败，请检查网络连接');
    }
}

// 删除请假
async function deleteLeave(recordId) {
    if (!confirm('确定要删除这条请假记录吗？')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/leave/${recordId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.code === 200) {
            alert('✅ 删除成功');
            loadLeaveRecords();
        } else {
            alert(result.message || '删除失败');
        }
    } catch (error) {
        console.error('删除请假失败:', error);
        alert('删除失败，请检查网络连接');
    }
}

// 加载统计数据
async function loadStatistics() {
    if (!currentInternId) return;

    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        // 加载月度统计
        const monthlyResponse = await fetch(`${API_BASE}/salary/monthly?intern_id=${currentInternId}&year=${year}&month=${month}`);
        const monthlyResult = await monthlyResponse.json();

        if (monthlyResult.code === 200) {
            const data = monthlyResult.data;
            document.getElementById('monthly-salary').textContent = data.total_salary.toFixed(2);
            document.getElementById('monthly-work-days').textContent = data.work_days;
            document.getElementById('monthly-leave-days').textContent = data.leave_days;
        }

        // 加载年度统计
        const yearlyResponse = await fetch(`${API_BASE}/salary/yearly?intern_id=${currentInternId}&year=${year}`);
        const yearlyResult = await yearlyResponse.json();

        if (yearlyResult.code === 200) {
            const data = yearlyResult.data;
            document.getElementById('yearly-salary').textContent = `¥${data.total_salary.toFixed(2)}`;
            document.getElementById('yearly-work-days').textContent = `${data.total_work_days}天`;
            document.getElementById('yearly-leave-days').textContent = `${data.total_leave_days}天`;

            // 更新有趣总结
            updateFunSummary(data);
        }
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 更新有趣总结
function updateFunSummary(data) {
    const totalSalary = data.total_salary;
    const workDays = data.total_work_days;

    let text;
    if (totalSalary > 10000) {
        text = `哇！今年已经赚了 ${totalSalary.toFixed(2)} 元，快过万啦！继续加油💪`;
    } else if (totalSalary > 5000) {
        text = `今年已经赚了 ${totalSalary.toFixed(2)} 元，不错不错！向着目标前进🚀`;
    } else if (workDays > 30) {
        text = `已经工作了 ${workDays} 天，坚持就是胜利！🌟`;
    } else if (workDays > 0) {
        text = `实习之路刚开始，未来可期！加油鸭🦆`;
    } else {
        text = `开始记录你的薪资进度吧！每一天都很重要✨`;
    }

    document.getElementById('fun-summary').innerHTML = `
        <div class="fun-emoji">🎉</div>
        <div class="fun-text">${text}</div>
    `;
}

// 页面切换时停止定时器
window.addEventListener('beforeunload', () => {
    stopRealtimeUpdate();
});

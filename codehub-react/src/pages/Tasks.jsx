import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../services/api.js";
import { usePageTitle } from "../hooks/usePageTitle.js";

export default function Tasks() {
  console.log('TASKS COMPONENT RENDERING!');
  usePageTitle('Taskovi')
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: ""
  });
  const location = useLocation();

  useEffect(() => {
    // Check if we came from dashboard with a filter
    if (location.state?.filter) {
      setFilter(location.state.filter);
    }
  }, [location.state]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await api.get("/api/tasks");
        console.log('Loaded tasks:', data);
        if (mounted) setTasks(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function add() {
    console.log('ADD FUNCTION CALLED!', { form });
    if (!form.title.trim()) {
      console.log('No title provided, returning early');
      return;
    }
    console.log('Proceeding with task creation...');
    try {
      const response = await api.post("/api/tasks", {
        title: form.title,
        description: form.description,
        priority: form.priority,
        due_date: form.dueDate,
        status: "todo"
      });
      console.log('Created task response:', response);
      // Handle both old and new response formats
      const created = response.task || response;
      setTasks((t) => [created, ...t]);
      setForm({
        title: "",
        description: "",
        priority: "medium",
        dueDate: ""
      });
      setShowForm(false);
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggle(id, currentStatus) {
    try {
      const status = currentStatus === "done" ? "todo" : "done";
      const updated = await api.put(`/api/tasks/${id}`, { status });
      setTasks((ts) =>
        ts.map((t) => (t.id === id ? updated : t))
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function updateStatus(id, status) {
    console.log('updateStatus called:', { id, status });
    try {
      const updated = await api.put(`/api/tasks/${id}`, { status });
      console.log('Status updated successfully:', updated);
      setTasks((ts) =>
        ts.map((t) => (t.id === id ? updated : t))
      );
    } catch (e) {
      console.error('Error updating status:', e);
      setError(e.message);
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((ts) => ts.filter((t) => t.id !== id));
      setSelectedTask(null);
    } catch (e) {
      setError(e.message);
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const priorityColors = {
    low: "var(--color-green-600)",
    medium: "var(--color-yellow-600)",
    high: "var(--color-red-600)"
  };

  const statusColors = {
    todo: "var(--color-gray-600)",
    doing: "var(--color-orange-600)",
    done: "var(--color-green-600)"
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* Header with Filter */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Taskovi</h2>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Otkaži" : "+ Dodaj Task"}
          </button>
        </div>
        
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {["all", "todo", "doing", "done"].map((status) => (
            <button
              key={status}
              className={`btn ${filter === status ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilter(status)}
              style={{ textTransform: "capitalize" }}
            >
              {status === "all" ? "Svi" : status}
            </button>
          ))}
        </div>

        {error && <div style={{ color: "var(--color-danger-600)", marginBottom: "16px" }}>{error}</div>}
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontWeight: 700, marginBottom: "16px" }}>Dodaj novi task</h3>
          <div style={{ display: "grid", gap: "16px" }}>
            <input
              className="input"
              placeholder="Naslov taska"
              value={form.title}
              onChange={(e) => {
                console.log('Input changed:', e.target.value);
                setForm(f => ({ ...f, title: e.target.value }));
              }}
            />
            <textarea
              className="textarea"
              placeholder="Opis taska"
              rows={3}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option value="low">Nizak prioritet</option>
                <option value="medium">Srednji prioritet</option>
                <option value="high">Visok prioritet</option>
              </select>
              <input
                className="input"
                type="date"
                placeholder="Rok završetka"
                value={form.dueDate}
                onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <button className="btn btn-primary" onClick={() => {
              console.log('Add button clicked!');
              add();
            }}>
              Dodaj Task
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="card">Učitavanje taskova...</div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filteredTasks.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <h3 style={{ margin: "0 0 8px 0", color: "var(--color-gray-600)" }}>Nema taskova</h3>
              <p style={{ margin: 0, color: "var(--color-gray-500)" }}>
                {filter === "all" ? "Dodaj svoj prvi task" : `Nema taskova sa statusom "${filter}"`}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <input
                        type="checkbox"
                        checked={task.status === "done"}
                        onChange={() => toggle(task.id, task.status)}
                        style={{ transform: "scale(1.2)" }}
                      />
                      <h3 style={{ 
                        margin: 0, 
                        fontWeight: 600,
                        textDecoration: task.status === "done" ? "line-through" : "none",
                        opacity: task.status === "done" ? 0.7 : 1
                      }}>
                        {task.title}
                      </h3>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: `${priorityColors[task.priority]}20`,
                        color: priorityColors[task.priority]
                      }}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p style={{ margin: "0 0 8px 0", color: "var(--color-gray-600)" }}>
                        {task.description}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: "16px", fontSize: "0.875rem", color: "var(--color-gray-500)" }}>
                      {task.due_date && (
                        <span>📅 Rok: {new Date(task.due_date).toLocaleDateString('sr-RS')}</span>
                      )}
                      <span>📝 Kreiran: {new Date(task.created_at).toLocaleDateString('sr-RS')}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      value={task.status}
                      onChange={(e) => {
                        console.log('Status change:', task.id, e.target.value);
                        updateStatus(task.id, e.target.value);
                      }}
                      className="input"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--color-gray-300)",
                        backgroundColor: "var(--color-white)",
                        color: statusColors[task.status],
                        fontWeight: 600,
                        cursor: "pointer",
                        minWidth: "100px"
                      }}
                    >
                      <option value="todo">To-Do</option>
                      <option value="doing">Doing</option>
                      <option value="done">Done</option>
                    </select>
                    <button
                      className="btn btn-outline"
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                    >
                      {selectedTask === task.id ? "Sakrij" : "Detalji"}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => remove(task.id)}
                      style={{ borderColor: "var(--color-danger-300)", color: "var(--color-danger-600)" }}
                    >
                      Obriši
                    </button>
                  </div>
                </div>

                {/* Task Details */}
                {selectedTask === task.id && (
                  <div style={{
                    padding: "16px",
                    backgroundColor: "var(--color-gray-50)",
                    borderRadius: "8px",
                    marginTop: "12px"
                  }}>
                    <h4 style={{ margin: "0 0 12px 0", fontWeight: 600 }}>Detalji taska</h4>
                    <div style={{ display: "grid", gap: "8px", fontSize: "0.875rem" }}>
                      <div><strong>Status:</strong> {task.status}</div>
                      <div><strong>Prioritet:</strong> {task.priority}</div>
                      <div><strong>Kreiran:</strong> {new Date(task.created_at).toLocaleString('sr-RS')}</div>
                      {task.updated_at !== task.created_at && (
                        <div><strong>Ažuriran:</strong> {new Date(task.updated_at).toLocaleString('sr-RS')}</div>
                      )}
                      {task.completed_at && (
                        <div><strong>Završen:</strong> {new Date(task.completed_at).toLocaleString('sr-RS')}</div>
                      )}
                      {task.due_date && (
                        <div><strong>Rok:</strong> {new Date(task.due_date).toLocaleDateString('sr-RS')}</div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

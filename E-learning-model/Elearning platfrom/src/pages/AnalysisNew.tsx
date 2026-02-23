import { useEffect, useState, FC, ReactNode } from "react";
import * as analysisApi from "@/api/analysis";
import "./DataPage.css";
import "./Analysis.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { AnalysisData } from "@/types";

interface MetricsData {
  uptime?: number;
  memory?: number;
  cpu?: number;
  studentsPerCourse?: Array<{ name?: string; courseName?: string; count?: number }> | Array<{ [key: string]: string | number }>;
  instructorsPerCourse?: Array<{ name?: string; courseName?: string; count?: number }> | Array<{ [key: string]: string | number }>;
  userRoleDistribution?: Array<{ role?: string; name?: string; value?: number }> | Array<{ [key: string]: string | number }>;
  Courses?: Array<{ [key: string]: string | number }>;
  UserCounts?: {
    Students: number;
    Instructors: number;
    Admins: number;
  };
  startedAt?: string;
  workingSetBytes?: number;
  managedHeapBytes?: number;
  cpuPercent?: number;
  processorCount?: number;
}

const AnalysisPage: FC = (): ReactNode => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analysisApi.getAnalysis();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMetrics((data as any) || {});
      } catch (err: Error | unknown) {
        setError(err instanceof Error ? err.message : "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="data-page animate-fade-in">
      <div className="page-header">
        <h2>Analysis</h2>
        <p>System metrics and performance</p>
      </div>

      {loading && (
        <div className="analysis-loading animate-pulse">
          <div className="analysis-spinner" />
          <p>Loading metrics…</p>
        </div>
      )}
      {error && <div className="data-error">{error}</div>}

      {metrics && !loading && (
        <div className="analysis-grid">
          <div className="analysis-card animate-slide-up" style={{ animationDelay: "0ms" }}>
            <div className="analysis-card-icon">⏱️</div>
            <h6>Uptime</h6>
            <p className="analysis-value">{metrics.uptime}</p>
            <p className="analysis-meta">Started {new Date(metrics.startedAt).toLocaleString()}</p>
          </div>

          <div className="analysis-card animate-slide-up" style={{ animationDelay: "80ms" }}>
            <div className="analysis-card-icon">💾</div>
            <h6>Memory</h6>
            <p className="analysis-value">Working: {Math.round(metrics.workingSetBytes / 1024 / 1024)} MB</p>
            <p className="analysis-value">Heap: {Math.round(metrics.managedHeapBytes / 1024 / 1024)} MB</p>
          </div>

          <div className="analysis-card animate-slide-up" style={{ animationDelay: "160ms" }}>
            <div className="analysis-card-icon">⚡</div>
            <h6>CPU</h6>
            <p className="analysis-value">{metrics.cpuPercent}%</p>
            <p className="analysis-meta">Processors: {metrics.processorCount}</p>
          </div>

          <div className="analysis-card analysis-card-wide animate-slide-up" style={{ animationDelay: "240ms" }}>
            <h6>Details</h6>
            <pre className="analysis-pre">{JSON.stringify(metrics, null, 2)}</pre>
          </div>

          {metrics.Courses && metrics.Courses.length > 0 && (
            <div className="analysis-card analysis-card-wide animate-slide-up" style={{ animationDelay: "320ms" }}>
              <h6>Students and Instructors per Course</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.Courses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="studentCount" fill="#8884d8" name="Students" animationBegin={0} animationDuration={1000} />
                  <Bar dataKey="instructorCount" fill="#82ca9d" name="Instructors" animationBegin={200} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {metrics.UserCounts && (
            <div className="analysis-card analysis-card-wide animate-slide-up" style={{ animationDelay: "400ms" }}>
              <h6>User Roles Distribution</h6>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Students", value: metrics.UserCounts.Students },
                      { name: "Instructors", value: metrics.UserCounts.Instructors },
                      { name: "Admins", value: metrics.UserCounts.Admins }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {[
                      { name: "Students", value: metrics.UserCounts.Students },
                      { name: "Instructors", value: metrics.UserCounts.Instructors },
                      { name: "Admins", value: metrics.UserCounts.Admins }
                    ].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;

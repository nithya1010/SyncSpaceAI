import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [activeWorkspace, setActiveWorkspace] = useState(null);

  useEffect(() => {
    // Only fetch if token exists
    if (!localStorage.getItem('syncspace_token')) return;

    const fetchWorkspaces = async () => {
      try {
        const res = await api.get("/workspaces");
        if (res.data.length > 0) {
          setActiveWorkspace(res.data[0]);
        } else {
          const createRes = await api.post("/workspaces", {
            name: "Personal Workspace",
            description: "Default workspace for your tasks"
          });
          setActiveWorkspace(createRes.data);
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };
    fetchWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => useContext(WorkspaceContext);
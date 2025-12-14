import React, { useEffect, useState } from "react";
import { X, Folder, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchFolderTree } from "../services/storage";
import type { FolderTreeDto } from "../services/interfaces";

interface FolderNode extends FolderTreeDto {
  isExpanded?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (folderId: string | null) => void;
  onCreateFolder: (parentId: string | null, parentName: string) => void;
  treeVersion: number;
  mode?: "copy" | "restore" | "move";
}

const CopyFileDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  onCreateFolder,
  treeVersion,
  mode = "copy"
}) => {
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [selected, setSelected] = useState<{ id: string | null; name: string } | null>({
    id: null,
    name: "Все файлы"
  });

  const [expandAfterReloadId, setExpandAfterReloadId] = useState<string | null>(null);

  

  useEffect(() => {
    if (!isOpen) return;

    fetchFolderTree().then(data => {
      const wrap = (nodes: FolderTreeDto[]): FolderNode[] =>
        nodes.map(n => ({
          ...n,
          isExpanded: false,
          children: n.children ? wrap(n.children) : []
        }));

        let newTree: FolderNode[] = [
            {
            id: "root",
            name: "Все файлы",
            depth: 0,
            isExpanded: true,
            children: wrap(data)
            }
        ];

        if (expandAfterReloadId !== null) {
            newTree = expandPathTo(newTree, expandAfterReloadId);

            setSelected({
            id: expandAfterReloadId,
            name: selected?.name ?? "Все файлы"
            });

            setExpandAfterReloadId(null);
        }

        setTree(newTree);
    });
    

    // if (isOpen) {
    //     setSelected({ id: null, name: "Все файлы" });
    // }
  }, [isOpen, treeVersion]);

  const toggle = (id: string) => {
    const update = (nodes: FolderNode[]): FolderNode[] =>
      nodes.map(n => ({
        ...n,
        isExpanded: n.id === id ? !n.isExpanded : n.isExpanded,
        children: update(n.children || [])
      }));
    setTree(update(tree));
  };

  const expandPathTo = (nodes: FolderNode[], targetId: string | null): FolderNode[] => {
    if (targetId === null) {
        return nodes.map(n =>
        n.id === "root" ? { ...n, isExpanded: true } : n
        );
    }

    return nodes.map(node => {
        if (!node.children?.length) return node;

        const updatedChildren = expandPathTo(node.children, targetId);
        const shouldExpand = updatedChildren.some(
        c => c.id === targetId || c.isExpanded
        );

        return {
        ...node,
        isExpanded: shouldExpand,
        children: updatedChildren
        };
    });
    };


  const renderTree = (nodes: FolderNode[], level = 0) =>
    nodes.map(n => (
      <div key={n.id}>
        <div
          className={`flex items-center px-3 py-2 rounded-lg cursor-pointer
            ${(n.id === "root" && selected?.id === null) || (n.id !== "root" && selected?.id === n.id) ?
                 "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}
          `}
          style={{ paddingLeft: 12 + level * 16 }}
          onClick={() =>
            setSelected({
                id: n.id === "root" ? null : n.id,
                name: n.name
            })
          }
        >
          {n.children?.length ? (
            <button
              onClick={e => {
                e.stopPropagation();
                toggle(n.id);
              }}
              className="mr-1"
            >
              {n.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-4" />
          )}

          <Folder size={18} className="text-yellow-500 mr-2" />
          <span className="truncate">{n.name}</span>
        </div>

        {n.isExpanded && n.children && renderTree(n.children, level + 1)}
      </div>
    ));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl w-full max-w-md p-5"
          >
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-lg">
                {mode === "copy" ? "Copy to a Folder" 
                    : mode === "restore" ? "Restore to a Folder"
                    : "Move to a Folder"}
              </h2>
              <button onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="max-h-72 overflow-auto border rounded-lg mb-4">
              {renderTree(tree)}
            </div>

            <div className="flex justify-between">
              <button
                className="px-4 py-2 border rounded-xl"
                onClick={() =>{
                    setExpandAfterReloadId(selected?.id ?? null);
                    onCreateFolder(
                        selected?.id ?? null,
                        selected?.name ?? "Все файлы"
                    );
                }}
              >
                Create Folder
              </button>

              <button
                disabled={selected === undefined}
                onClick={() => onConfirm(selected?.id ?? null)}
                className="px-4 py-2 bg-[#4B67F5] text-white rounded-xl disabled:opacity-50"
              >
                {mode === "copy" ? "Copy" : mode === "restore" ? "Restore" : "Move"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CopyFileDialog;
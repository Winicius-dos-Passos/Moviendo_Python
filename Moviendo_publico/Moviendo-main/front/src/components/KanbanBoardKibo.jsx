import { useState, useEffect, useRef } from 'react';
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
} from '@/components/kibo-ui/kanban';
import { Star, Film, Tv, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '../constants/status';

const KanbanBoardKibo = ({ obras, onUpdateStatus, onCardClick }) => {
  const [kanbanData, setKanbanData] = useState([]);

  const columns = [
    { id: 'QUERO_ASSISTIR', name: STATUS_LABELS.QUERO_ASSISTIR, color: 'from-blue-600 to-blue-800' },
    { id: 'ASSISTINDO', name: STATUS_LABELS.ASSISTINDO, color: 'from-yellow-600 to-yellow-800' },
    { id: 'ASSISTIDO', name: STATUS_LABELS.ASSISTIDO, color: 'from-purple-600 to-purple-800' },
  ];

  useEffect(() => {
    const data = obras.map((obra) => ({
      id: obra.id.toString(),
      column: obra.status,
      name: obra.titulo,
      obra: obra,
    }));
    setKanbanData(data);
  }, [obras]);

  const renderCard = (item) => {
    const obra = item.obra;
    return (
      <KanbanCard
        key={item.id}
        id={item.id}
        className="!bg-transparent !border-0 !shadow-none !p-0 !m-0"
        onPointerDown={(e) => {
          const startX = e.clientX;
          const startY = e.clientY;
          const handlePointerUp = (upEvent) => {
            const deltaX = Math.abs(upEvent.clientX - startX);
            const deltaY = Math.abs(upEvent.clientY - startY);
            if (deltaX < 5 && deltaY < 5) {
              onCardClick(obra);
            }
            document.removeEventListener('pointerup', handlePointerUp);
          };
          document.addEventListener('pointerup', handlePointerUp);
        }}
      >
        <div 
          className="flex items-center gap-3 cursor-pointer bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700 hover:border-purple-500 transition-all duration-200 shadow-md"
        >
          <div className="w-12 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
            {obra.urlCapa ? (
              <img
                src={obra.urlCapa}
                alt={obra.titulo}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {obra.tipo === 'SERIE' ? (
                  <Tv className="w-6 h-6 text-gray-600" />
                ) : (
                  <Film className="w-6 h-6 text-gray-600" />
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-sm truncate">
              {obra.titulo}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              {obra.anoLancamento && <span>{obra.anoLancamento}</span>}
              {obra.notaPessoal && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-yellow-500 font-medium">{obra.notaPessoal.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flx-shrink-0 flex items-center gap-2">
            {obra.tipo === 'SERIE' ? (
              <Tv className="w-4 h-4 text-purple-400" />
            ) : (
              <Film className="w-4 h-4 text-purple-400" />
            )}
            
            <button
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCardClick(obra);
              }}
              className="p-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white transition-all duration-200 group z-10 relative"
              title="Ver detalhes"
            >
              <Eye className="w-4 h-4 pointer-events-none" />
            </button>
          </div>
        </div>
      </KanbanCard>
    );
  };

  const draggedItemRef = useRef(null);
  const originalColumnRef = useRef(null);
  const targetColumnRef = useRef(null);

  const handleDragStart = (event) => {
    const draggedItem = kanbanData.find(item => item.id === event.active.id.toString());
    draggedItemRef.current = draggedItem;
    originalColumnRef.current = draggedItem?.column;
  };

  const handleDragOver = (event) => {
    if (!event.over) return;
    
    let targetColumn = null;
    
    const isColumn = columns.find(col => col.id === event.over.id);
    if (isColumn) {
      targetColumn = event.over.id;
    } else {
      const overItem = kanbanData.find(item => item.id === event.over.id.toString());
      if (overItem) {
        targetColumn = overItem.column;
      }
    }
    
    if (targetColumn) {
      targetColumnRef.current = targetColumn;
    }
  };

  const handleDragEnd = () => {
    const draggedItem = draggedItemRef.current;
    const originalColumn = originalColumnRef.current;
    const targetColumn = targetColumnRef.current;
    
    if (!draggedItem) {
      return;
    }

    if (targetColumn && originalColumn !== targetColumn) {
      onUpdateStatus(parseInt(draggedItem.id), targetColumn);
    }
    
    draggedItemRef.current = null;
    originalColumnRef.current = null;
    targetColumnRef.current = null;
  };

  return (
    <KanbanProvider
      columns={columns}
      data={kanbanData}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      className="w-full"
    >
      {(column) => {
        const columnObras = kanbanData.filter(item => item.column === column.id);
        
        return (
          <KanbanBoard key={column.id} id={column.id} className="bg-gray-900/50 border-gray-800">
            <KanbanHeader className={`bg-gradient-to-r ${column.color} text-white p-4 flex items-center justify-between`}>
              <span className="font-semibold text-lg">{column.name}</span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {columnObras.length}
              </Badge>
            </KanbanHeader>

            <KanbanCards id={column.id} className="gap-2">
              {renderCard}
            </KanbanCards>
          </KanbanBoard>
        );
      }}
    </KanbanProvider>
  );
};

export default KanbanBoardKibo;

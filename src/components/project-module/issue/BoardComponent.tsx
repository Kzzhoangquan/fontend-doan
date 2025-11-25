
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import invariant from 'tiny-invariant';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import * as liveRegion from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { useRouter, usePathname } from 'next/navigation';
import { Button, message, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

import { type ColumnMap, type ColumnType, type Issue } from '@/components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/data/people';
import Board from '@/components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/pieces/board/board';
import { BoardContext, type BoardContextValue } from '@/components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/pieces/board/board-context';
import { Column } from '@/components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/pieces/board/column';
import { createRegistry } from '@/components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/pieces/board/registry';
import { CreateIssueModal } from '@/components/project-module/issue/CreateIssueModal';
import { boardService } from '@/lib/api/services/board.service';
import { BoardFilter, BoardFilterValues, useFilteredBoardData } from './BoardFilter';

type Outcome =
	| {
			type: 'column-reorder';
			columnId: string;
			startIndex: number;
			finishIndex: number;
	  }
	| {
			type: 'card-reorder';
			columnId: string;
			startIndex: number;
			finishIndex: number;
	  }
	| {
			type: 'card-move';
			finishColumnId: string;
			itemIndexInStartColumn: number;
			itemIndexInFinishColumn: number;
	  };

type Trigger = 'pointer' | 'keyboard';

type Operation = {
	trigger: Trigger;
	outcome: Outcome;
};

type BoardState = {
	columnMap: ColumnMap;
	orderedColumnIds: string[];
	lastOperation: Operation | null;
};

type BoardProps = {
    projectId: number;
    boardId: number;
};

export const BoardComponent: React.FC<BoardProps> = ({
    projectId,
    boardId,
}) =>  {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const [data, setData] = useState<BoardState | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Filter state
	const [filters, setFilters] = useState<BoardFilterValues>({
		search: '',
		assigneeIds: [],
		issueTypeIds: [],
		epicIds: [],
	});

	const pathname = usePathname();
	const pathSegments = pathname.split('/');
	const workflowId = pathSegments[pathSegments.length - 1];

	// Fetch data từ API
	const fetchBoardData = async () => {
		try {
			setLoading(true);
			
			const apiData = await boardService.getBoardByWorkflow(boardId ?? 1);
			
			console.log('API data:', apiData);
			
			const transformedData = {
				columnMap: apiData.columnMap || {},
				orderedColumnIds: apiData.orderedColumnIds || [],
				lastOperation: null,
			};
			
			setData(transformedData);
			setError(null);
		} catch (err) {
			console.error('Error fetching board data:', err);
			setError(err instanceof Error ? err.message : 'Failed to fetch data');
		} finally {
			setLoading(false);
		}
	};

	// Fetch data khi component mount
	useEffect(() => {
		fetchBoardData();
	}, [workflowId]);

	// Handle create issue success
	const handleCreateIssue = (newIssue: any) => {
		console.log('New issue created:', newIssue);
		// Refresh board data
		fetchBoardData();
	};

	// Handle refresh
	const handleRefresh = () => {
		fetchBoardData();
	};

	// Handle filter change
	const handleFilterChange = (newFilters: BoardFilterValues) => {
		setFilters(newFilters);
	};

	// Apply filters to data
	const { filteredData, totalIssues, filteredCount } = useFilteredBoardData(data, filters);

	// Use filtered data for display, original data for drag operations
	const displayData = filteredData;

	const stableData = useRef(data);
	useEffect(() => {
		stableData.current = data;
	}, [data]);

	const [registry] = useState(createRegistry);

	const lastOperation = data?.lastOperation;

	useEffect(() => {
		if (!lastOperation || !data) {
			return;
		}
		const { outcome, trigger } = lastOperation;

		if (outcome.type === 'column-reorder') {
			const { startIndex, finishIndex } = outcome;

			const { columnMap, orderedColumnIds } = stableData.current!;
			const sourceColumn = columnMap[orderedColumnIds[finishIndex]];

			const entry = registry.getColumn(sourceColumn.columnId);
			triggerPostMoveFlash(entry.element);

			liveRegion.announce(
				`You've moved ${sourceColumn.title} from position ${
					startIndex + 1
				} to position ${finishIndex + 1} of ${orderedColumnIds.length}.`,
			);

			return;
		}

		if (outcome.type === 'card-reorder') {
			const { columnId, startIndex, finishIndex } = outcome;

			const { columnMap } = stableData.current!;
			const column = columnMap[columnId];
			const item = column.items[finishIndex];

			const entry = registry.getCard(item.issueId);
			triggerPostMoveFlash(entry.element);

			if (trigger !== 'keyboard') {
				return;
			}

			liveRegion.announce(
				`You've moved ${item.name} from position ${
					startIndex + 1
				} to position ${finishIndex + 1} of ${column.items.length} in the ${column.title} column.`,
			);

			return;
		}

		if (outcome.type === 'card-move') {
			const { finishColumnId, itemIndexInStartColumn, itemIndexInFinishColumn } = outcome;

			const dataRef = stableData.current!;
			const destinationColumn = dataRef.columnMap[finishColumnId];
			const item = destinationColumn.items[itemIndexInFinishColumn];

			const finishPosition =
				typeof itemIndexInFinishColumn === 'number'
					? itemIndexInFinishColumn + 1
					: destinationColumn.items.length;

			const entry = registry.getCard(item.issueId);
			triggerPostMoveFlash(entry.element);

			if (trigger !== 'keyboard') {
				return;
			}

			liveRegion.announce(
				`You've moved ${item.name} from position ${
					itemIndexInStartColumn + 1
				} to position ${finishPosition} in the ${destinationColumn.title} column.`,
			);

			entry.actionMenuTrigger.focus();

			return;
		}
	}, [lastOperation, registry, data]);

	useEffect(() => {
		return liveRegion.cleanup();
	}, []);

	const getColumns = useCallback(() => {
		const currentData = stableData.current;
		if (!currentData) return [];
		const { columnMap, orderedColumnIds } = currentData;
		return orderedColumnIds.map((columnId) => columnMap[columnId]);
	}, []);

	const reorderColumn = useCallback(
		({
			startIndex,
			finishIndex,
			trigger = 'keyboard',
		}: {
			startIndex: number;
			finishIndex: number;
			trigger?: Trigger;
		}) => {
			setData((data) => {
				if (!data) return data;
				
				const outcome: Outcome = {
					type: 'column-reorder',
					columnId: data.orderedColumnIds[startIndex],
					startIndex,
					finishIndex,
				};

				return {
					...data,
					orderedColumnIds: reorder({
						list: data.orderedColumnIds,
						startIndex,
						finishIndex,
					}),
					lastOperation: {
						outcome,
						trigger: trigger,
					},
				};
			});
		},
		[],
	);

	const reorderCard = useCallback(
		({
			columnId,
			startIndex,
			finishIndex,
			trigger = 'keyboard',
		}: {
			columnId: string;
			startIndex: number;
			finishIndex: number;
			trigger?: Trigger;
		}) => {
			setData((data) => {
				if (!data) return data;
				
				const sourceColumn = data.columnMap[columnId];
				const updatedItems = reorder({
					list: sourceColumn.items,
					startIndex,
					finishIndex,
				});

				const updatedSourceColumn: ColumnType = {
					...sourceColumn,
					items: updatedItems,
				};

				const updatedMap: ColumnMap = {
					...data.columnMap,
					[columnId]: updatedSourceColumn,
				};

				const outcome: Outcome | null = {
					type: 'card-reorder',
					columnId,
					startIndex,
					finishIndex,
				};

				return {
					...data,
					columnMap: updatedMap,
					lastOperation: {
						trigger: trigger,
						outcome,
					},
				};
			});
		},
		[],
	);

	const moveCard = useCallback(
		({
			startColumnId,
			finishColumnId,
			itemIndexInStartColumn,
			itemIndexInFinishColumn,
			trigger = 'keyboard',
		}: {
			startColumnId: string;
			finishColumnId: string;
			itemIndexInStartColumn: number;
			itemIndexInFinishColumn?: number;
			trigger?: 'pointer' | 'keyboard';
		}) => {
			if (startColumnId === finishColumnId) {
				return;
			}
			setData((data) => {
				if (!data) return data;
				
				const sourceColumn = data.columnMap[startColumnId];
				const destinationColumn = data.columnMap[finishColumnId];
				const item: Issue = sourceColumn.items[itemIndexInStartColumn];

				const destinationItems = Array.from(destinationColumn.items);
				const newIndexInDestination = itemIndexInFinishColumn ?? 0;
				destinationItems.splice(newIndexInDestination, 0, item);

				const updatedMap = {
					...data.columnMap,
					[startColumnId]: {
						...sourceColumn,
						items: sourceColumn.items.filter((i) => i.issueId !== item.issueId),
					},
					[finishColumnId]: {
						...destinationColumn,
						items: destinationItems,
					},
				};

				const outcome: Outcome | null = {
					type: 'card-move',
					finishColumnId,
					itemIndexInStartColumn,
					itemIndexInFinishColumn: newIndexInDestination,
				};

				return {
					...data,
					columnMap: updatedMap,
					lastOperation: {
						outcome,
						trigger: trigger,
					},
				};
			});
		},
		[],
	);

	// Sync with backend when operations occur
	useEffect(() => {
		if (!data || data.lastOperation === null) {
			return;
		}

		const { outcome } = data.lastOperation;
		const { columnMap, orderedColumnIds } = data;

		const syncWithBackend = async () => {
			try {
				switch (outcome.type) {
					case 'column-reorder': {
						await boardService.reorderColumns(parseInt(workflowId), {
							orderedColumnIds: orderedColumnIds.map(id => parseInt(id))
						});
						console.log('[API SUCCESS] Columns reordered');
						break;
					}

					case 'card-reorder': {
						const { columnId } = outcome;
						const column = columnMap[columnId];
						
						const orderedIssueIds = column.items.map(item => item.id);

						await boardService.reorderCards(parseInt(columnId), {
							orderedIssueIds
						});
						console.log('[API SUCCESS] Cards reordered');
						break;
					}

					case 'card-move': {
						const { finishColumnId, itemIndexInFinishColumn } = outcome;
						const destinationColumn = columnMap[finishColumnId];
						const movedCard = destinationColumn.items[itemIndexInFinishColumn];
						
						const movedCardId = movedCard.id;

						await boardService.moveCard(movedCardId, {
							targetStatusId: parseInt(finishColumnId),
							targetIndex: itemIndexInFinishColumn,
						});
						console.log('[API SUCCESS] Card moved');
						break;
					}

					default:
						return;
				}
			} catch (error) {
				console.error('[API CALL FAILED]', error);
				message.error('Không thể đồng bộ với server');
			}
		};

		syncWithBackend();

	}, [data, workflowId]);

	const [instanceId] = useState(() => Symbol('instance-id'));

	useEffect(() => {
		if (!data) return;
		
		return combine(
			monitorForElements({
				canMonitor({ source }) {
					return source.data.instanceId === instanceId;
				},
				onDrop(args) {
					const { location, source } = args;
					if (!location.current.dropTargets.length) {
						return;
					}

					if (source.data.type === 'column') {
						const startIndex: number = data.orderedColumnIds.findIndex(
							(columnId) => columnId === source.data.columnId,
						);

						const target = location.current.dropTargets[0];
						const indexOfTarget: number = data.orderedColumnIds.findIndex(
							(id) => id === target.data.columnId,
						);
						const closestEdgeOfTarget: Edge | null = extractClosestEdge(target.data);

						const finishIndex = getReorderDestinationIndex({
							startIndex,
							indexOfTarget,
							closestEdgeOfTarget,
							axis: 'horizontal',
						});

						reorderColumn({ startIndex, finishIndex, trigger: 'pointer' });
					}

					if (source.data.type === 'card') {
						const itemId = source.data.itemId;
						invariant(typeof itemId === 'string');
						const [, startColumnRecord] = location.initial.dropTargets;
						const sourceId = startColumnRecord.data.columnId;
						invariant(typeof sourceId === 'string');
						const sourceColumn = data.columnMap[sourceId];
						const itemIndex = sourceColumn.items.findIndex((item) => item.issueId === itemId);

						if (location.current.dropTargets.length === 1) {
							const [destinationColumnRecord] = location.current.dropTargets;
							const destinationId = destinationColumnRecord.data.columnId;
							invariant(typeof destinationId === 'string');
							const destinationColumn = data.columnMap[destinationId];
							invariant(destinationColumn);

							if (sourceColumn === destinationColumn) {
								const destinationIndex = getReorderDestinationIndex({
									startIndex: itemIndex,
									indexOfTarget: sourceColumn.items.length - 1,
									closestEdgeOfTarget: null,
									axis: 'vertical',
								});
								reorderCard({
									columnId: sourceColumn.columnId,
									startIndex: itemIndex,
									finishIndex: destinationIndex,
									trigger: 'pointer',
								});
								return;
							}

							moveCard({
								itemIndexInStartColumn: itemIndex,
								startColumnId: sourceColumn.columnId,
								finishColumnId: destinationColumn.columnId,
								trigger: 'pointer',
							});
							return;
						}

						if (location.current.dropTargets.length === 2) {
							const [destinationCardRecord, destinationColumnRecord] = location.current.dropTargets;
							const destinationColumnId = destinationColumnRecord.data.columnId;
							invariant(typeof destinationColumnId === 'string');
							const destinationColumn = data.columnMap[destinationColumnId];

							const indexOfTarget = destinationColumn.items.findIndex(
								(item) => item.issueId === destinationCardRecord.data.itemId,
							);
							const closestEdgeOfTarget: Edge | null = extractClosestEdge(
								destinationCardRecord.data,
							);

							if (sourceColumn === destinationColumn) {
								const destinationIndex = getReorderDestinationIndex({
									startIndex: itemIndex,
									indexOfTarget,
									closestEdgeOfTarget,
									axis: 'vertical',
								});
								reorderCard({
									columnId: sourceColumn.columnId,
									startIndex: itemIndex,
									finishIndex: destinationIndex,
									trigger: 'pointer',
								});
								return;
							}

							const destinationIndex =
								closestEdgeOfTarget === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

							moveCard({
								itemIndexInStartColumn: itemIndex,
								startColumnId: sourceColumn.columnId,
								finishColumnId: destinationColumn.columnId,
								itemIndexInFinishColumn: destinationIndex,
								trigger: 'pointer',
							});
						}
					}
				},
			}),
		);
	}, [data, instanceId, moveCard, reorderCard, reorderColumn]);

	const contextValue: BoardContextValue = useMemo(() => {
		return {
			getColumns,
			reorderColumn,
			reorderCard,
			moveCard,
			registerCard: registry.registerCard,
			registerColumn: registry.registerColumn,
			instanceId,
		};
	}, [getColumns, reorderColumn, reorderCard, registry, moveCard, instanceId]);

	// Loading state
	if (loading) {
		return <div>Loading board data...</div>;
	}

	// Error state
	if (error) {
		return <div>Error: {error}</div>;
	}

	// No data state
	if (!data || !displayData) {
		return <div>No data available</div>;
	}

	return (
		<BoardContext.Provider value={contextValue}>
			{/* Header với Filter và Actions */}
			<div style={{ marginBottom: 16 }}>
				{/* Action Buttons */}
				<Space style={{ marginBottom: 12 }}>
					<Button 
						type="primary" 
						icon={<PlusOutlined />}
						onClick={() => setIsCreateModalOpen(true)}
					>
						Tạo Issue
					</Button>
					<Button 
						icon={<ReloadOutlined />}
						onClick={handleRefresh}
						loading={loading}
					>
						Làm mới
					</Button>
				</Space>

				{/* Filter Component */}
				<BoardFilter
					projectId={projectId}
					onFilterChange={handleFilterChange}
					totalIssues={totalIssues}
					filteredCount={filteredCount}
				/>
			</div>

			{/* Board */}
			<Board>
				{displayData.orderedColumnIds.map((columnId: any) => {
					return <Column column={displayData.columnMap[columnId]} key={columnId} />;
				})}
			</Board>
			
			{/* Create Issue Modal */}
			<CreateIssueModal
				visible={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={handleCreateIssue}
				projectId={projectId}
			/>
		</BoardContext.Provider>
	);
}
'use client';

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

import { type ColumnMap, type ColumnType, type Issue } from '../../../../../../components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/data/people';
import Board from '../../../../../../components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/pieces/board/board';
import { BoardContext, type BoardContextValue } from '../../../../../../components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/pieces/board/board-context';
import { Column } from '../../../../../../components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/pieces/board/column';
import { createRegistry } from '../../../../../../components/project-module/issue/pragmatic-drag-and-drop/documentation/examples/pieces/board/registry';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from 'antd';
import { CreateIssueModal } from '@/components/project-module/issue/CreateIssueModal';

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

export default function BoardExample() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const projectId = 1; // Lấy từ context hoặc props

	const handleCreateIssue = (newIssue: any) => {
		console.log('New issue created:', newIssue);
		// Refresh board data hoặc update state
		// Ví dụ: refetch board data
		// fetchBoardData();
	};

	const [data, setData] = useState<BoardState | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const pathname = usePathname();
	const pathSegments = pathname.split('/');
	const workflowId = pathSegments[pathSegments.length - 1];
	const API_URL = `/api/issues/workflow/${workflowId}/statuses`;

	// Fetch data từ API khi component mount
	useEffect(() => {
		const fetchBoardData = async () => {
			try {
				setLoading(true);
				
				const response = await fetch(API_URL);
				
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				
				const apiData = await response.json();
				console.log('API data:', apiData);
				
				// Transform API data thành format phù hợp với Board
				// Bạn cần điều chỉnh transformation này dựa trên cấu trúc API response thực tế
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

		fetchBoardData();
	}, []);

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

	useEffect(() => {
		if (!data || data.lastOperation === null) {
			return;
		}

		const { outcome } = data.lastOperation;
		const { columnMap, orderedColumnIds } = data;

		const syncWithBackend = async () => {
			try {
				let response: Response;

				switch (outcome.type) {
					case 'column-reorder': {
						// API 1: Reorder Columns
						response = await fetch(`/api/issues/workflow/${workflowId}/columns/reorder`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								orderedColumnIds: orderedColumnIds.map(id => parseInt(id))
							}),
						});
						break;
					}

					case 'card-reorder': {
						// API 2: Reorder Cards in Same Column
						const { columnId } = outcome;
						const column = columnMap[columnId];
						
						// Sử dụng trường 'id' từ item (database ID thực tế)
						const orderedIssueIds = column.items.map(item => item.id);

						response = await fetch(`/api/issues/status/${columnId}/cards/reorder`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ orderedIssueIds }),
						});
						break;
					}

					case 'card-move': {
						// API 3: Move Card to Different Column
						const { finishColumnId, itemIndexInFinishColumn } = outcome;
						const destinationColumn = columnMap[finishColumnId];
						const movedCard = destinationColumn.items[itemIndexInFinishColumn];
						
						// Sử dụng trường 'id' từ movedCard (database ID thực tế)
						const movedCardId = movedCard.id;

						response = await fetch(`/api/issues/card/${movedCardId}/move`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								targetStatusId: parseInt(finishColumnId),
								targetIndex: itemIndexInFinishColumn,
							}),
						});
						break;
					}

					default:
						return;
				}

				if (!response.ok) {
					const errorData = await response.json();
					console.error('[API ERROR]', errorData);
					// Có thể thêm logic rollback hoặc hiển thị error cho user
				} else {
					const result = await response.json();
					console.log('[API SUCCESS]', result);
				}
			} catch (error) {
				console.error('[API CALL FAILED]', error);
				// Có thể thêm logic rollback hoặc retry
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

	// Hiển thị loading state
	if (loading) {
		return <div>Loading board data...</div>;
	}

	// Hiển thị error state
	if (error) {
		return <div>Error: {error}</div>;
	}

	// Kiểm tra data có tồn tại không
	if (!data) {
		return <div>No data available</div>;
	}

	return (
		<BoardContext.Provider value={contextValue}>
			<Button onClick={() => setIsCreateModalOpen(true)}>Create</Button>
			<Board>
				{data.orderedColumnIds.map((columnId) => {
					return <Column column={data.columnMap[columnId]} key={columnId} />;
				})}
			</Board>
			
			<CreateIssueModal
				visible={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={handleCreateIssue}
				projectId={projectId}
			/>
		</BoardContext.Provider>
	);
}
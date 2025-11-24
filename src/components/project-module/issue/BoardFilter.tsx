import React, { useEffect, useState } from 'react';
import {
    Card,
    Select,
    Input,
    Space,
    Button,
    Tag,
    Avatar,
    Tooltip,
    Divider,
    Badge,
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
    UserOutlined,
    AppstoreOutlined,
    FlagOutlined,
} from '@ant-design/icons';
import { issueService, Employee, IssueType } from '@/lib/api/services/issue.service';

const { Option } = Select;

export interface BoardFilterValues {
    search: string;
    assigneeIds: number[];
    issueTypeIds: number[];
    epicIds: number[];
}

interface BoardFilterProps {
    projectId: number;
    onFilterChange: (filters: BoardFilterValues) => void;
    totalIssues?: number;
    filteredCount?: number;
}

export const BoardFilter: React.FC<BoardFilterProps> = ({
    projectId,
    onFilterChange,
    totalIssues = 0,
    filteredCount,
}) => {
    const [search, setSearch] = useState('');
    const [assigneeIds, setAssigneeIds] = useState<number[]>([]);
    const [issueTypeIds, setIssueTypeIds] = useState<number[]>([]);
    const [epicIds, setEpicIds] = useState<number[]>([]);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
    const [epics, setEpics] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch filter options
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                setLoading(true);
                const [employeesData, issueTypesData, epicsData] = await Promise.all([
                    issueService.getProjectEmployees(projectId),
                    issueService.getIssueTypes(),
                    issueService.getProjectEpics ? issueService.getProjectEpics(projectId) : Promise.resolve([]),
                ]);
                setEmployees(employeesData);
                setIssueTypes(issueTypesData);
                setEpics(epicsData);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilterOptions();
    }, [projectId]);

    // Trigger filter change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onFilterChange({
                search,
                assigneeIds,
                issueTypeIds,
                epicIds,
            });
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [search, assigneeIds, issueTypeIds, epicIds]);

    // Clear all filters
    const handleClearFilters = () => {
        setSearch('');
        setAssigneeIds([]);
        setIssueTypeIds([]);
        setEpicIds([]);
    };

    // Check if any filter is active
    const hasActiveFilters = search || assigneeIds.length > 0 || issueTypeIds.length > 0 || epicIds.length > 0;
    const activeFilterCount = [
        search ? 1 : 0,
        assigneeIds.length > 0 ? 1 : 0,
        issueTypeIds.length > 0 ? 1 : 0,
        epicIds.length > 0 ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    return (
        <Card 
            size="small" 
            style={{ marginBottom: 16 }}
            bodyStyle={{ padding: '12px 16px' }}
        >
            <Space wrap size="middle" style={{ width: '100%' }}>
                {/* Search Input */}
                <Input
                    placeholder="Tìm kiếm issue..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 220 }}
                    allowClear
                />

                <Divider type="vertical" style={{ height: 32 }} />

                {/* Assignee Filter */}
                <Select
                    mode="multiple"
                    placeholder={
                        <Space>
                            <UserOutlined />
                            <span>Assignee</span>
                        </Space>
                    }
                    value={assigneeIds}
                    onChange={setAssigneeIds}
                    style={{ minWidth: 180 }}
                    maxTagCount={1}
                    maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
                    loading={loading}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                >
                    {employees.map((emp) => (
                        <Option key={emp.id} value={emp.id}>
                            <Space>
                                <Avatar size="small" icon={<UserOutlined />}>
                                    {emp.full_name?.[0]}
                                </Avatar>
                                {emp.full_name}
                            </Space>
                        </Option>
                    ))}
                </Select>

                {/* Issue Type Filter */}
                <Select
                    mode="multiple"
                    placeholder={
                        <Space>
                            <AppstoreOutlined />
                            <span>Loại issue</span>
                        </Space>
                    }
                    value={issueTypeIds}
                    onChange={setIssueTypeIds}
                    style={{ minWidth: 160 }}
                    maxTagCount={1}
                    maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
                    loading={loading}
                    allowClear
                >
                    {issueTypes.map((type) => (
                        <Option key={type.id} value={type.id}>
                            {type.type_name}
                        </Option>
                    ))}
                </Select>

                {/* Epic Filter */}
                {epics.length > 0 && (
                    <Select
                        mode="multiple"
                        placeholder={
                            <Space>
                                <FlagOutlined />
                                <span>Epic</span>
                            </Space>
                        }
                        value={epicIds}
                        onChange={setEpicIds}
                        style={{ minWidth: 160 }}
                        maxTagCount={1}
                        maxTagPlaceholder={(omittedValues) => `+${omittedValues.length}`}
                        loading={loading}
                        allowClear
                    >
                        {epics.map((epic) => (
                            <Option key={epic.id} value={epic.id}>
                                {epic.epic_name}
                            </Option>
                        ))}
                    </Select>
                )}

                <Divider type="vertical" style={{ height: 32 }} />

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Tooltip title="Xóa tất cả bộ lọc">
                        <Button
                            icon={<ClearOutlined />}
                            onClick={handleClearFilters}
                            type="text"
                            danger
                        >
                            Xóa lọc
                        </Button>
                    </Tooltip>
                )}

                {/* Filter Status */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {hasActiveFilters && (
                        <Badge count={activeFilterCount} size="small">
                            <Tag icon={<FilterOutlined />} color="blue">
                                Đang lọc
                            </Tag>
                        </Badge>
                    )}
                    <Tag color={hasActiveFilters ? 'orange' : 'default'}>
                        {filteredCount !== undefined ? (
                            <>
                                {filteredCount} / {totalIssues} issues
                            </>
                        ) : (
                            <>{totalIssues} issues</>
                        )}
                    </Tag>
                </div>
            </Space>
        </Card>
    );
};

/**
 * Hook để filter board data dựa trên filter values
 */
export const useFilteredBoardData = (
    boardData: any,
    filters: BoardFilterValues
) => {
    if (!boardData) return { filteredData: null, totalIssues: 0, filteredCount: 0 };

    const { columnMap, orderedColumnIds } = boardData;
    let totalIssues = 0;
    let filteredCount = 0;

    const filteredColumnMap: Record<string, any> = {};

    for (const columnId of orderedColumnIds) {
        const column = columnMap[columnId];
        const originalItems = column.items || [];
        totalIssues += originalItems.length;

        // Apply filters
        let filteredItems = [...originalItems];

        // Search filter - tìm theo issueId (issue_code), summary, hoặc tên assignee
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filteredItems = filteredItems.filter(
                (item: any) =>
                    item.issueId?.toLowerCase().includes(searchLower) ||
                    item.summary?.toLowerCase().includes(searchLower) ||
                    item.name?.toLowerCase().includes(searchLower) ||
                    // Tìm trong danh sách assignees
                    (item.assignees && item.assignees.some((a: any) => 
                        a.full_name?.toLowerCase().includes(searchLower)
                    ))
            );
        }

        // Assignee filter - sử dụng trường assignees (mảng) từ API
        if (filters.assigneeIds.length > 0) {
            filteredItems = filteredItems.filter((item: any) => {
                // Sử dụng trường assignees mới từ API
                if (item.assignees && Array.isArray(item.assignees) && item.assignees.length > 0) {
                    return item.assignees.some((a: any) => filters.assigneeIds.includes(a.id));
                }
                // Nếu không có assignee và đang filter theo assignee, ẩn item
                return false;
            });
        }

        // Issue Type filter - sử dụng trường issue_type_id từ API
        if (filters.issueTypeIds.length > 0) {
            filteredItems = filteredItems.filter((item: any) => {
                // Sử dụng trường issue_type_id mới từ API
                return filters.issueTypeIds.includes(item.issue_type_id);
            });
        }

        // Epic filter - sử dụng trường epic_link_id từ API
        if (filters.epicIds.length > 0) {
            filteredItems = filteredItems.filter((item: any) => {
                // Sử dụng trường epic_link_id mới từ API
                // Chú ý: epic_link_id có thể là null
                return item.epic_link_id && filters.epicIds.includes(item.epic_link_id);
            });
        }

        filteredCount += filteredItems.length;

        filteredColumnMap[columnId] = {
            ...column,
            items: filteredItems,
        };
    }

    return {
        filteredData: {
            ...boardData,
            columnMap: filteredColumnMap,
        },
        totalIssues,
        filteredCount,
    };
};
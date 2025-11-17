/**
 * These imports are written out explicitly because they
 * need to be statically analyzable to be uploaded to CodeSandbox correctly.
 */
import Alexander from './images/processed/Alexander';
import Aliza from './images/processed/Aliza';
import Alvin from './images/processed/Alvin';
import Angie from './images/processed/Angie';
import Arjun from './images/processed/Arjun';
import Blair from './images/processed/Blair';
import Claudia from './images/processed/Claudia';
import Colin from './images/processed/Colin';
import Ed from './images/processed/Ed';
import Effie from './images/processed/Effie';
import Eliot from './images/processed/Eliot';
import Fabian from './images/processed/Fabian';
import Gael from './images/processed/Gael';
import Gerard from './images/processed/Gerard';
import Hasan from './images/processed/Hasan';
import Helena from './images/processed/Helena';
import Ivan from './images/processed/Ivan';
import Katina from './images/processed/Katina';
import Lara from './images/processed/Lara';
import Leo from './images/processed/Leo';
import Lydia from './images/processed/Lydia';
import Maribel from './images/processed/Maribel';
import Milo from './images/processed/Milo';
import Myra from './images/processed/Myra';
import Narul from './images/processed/Narul';
import Norah from './images/processed/Norah';
import Oliver from './images/processed/Oliver';
import Rahul from './images/processed/Rahul';
import Renato from './images/processed/Renato';
import Steve from './images/processed/Steve';
import Tanya from './images/processed/Tanya';
import Tori from './images/processed/Tori';
import Vania from './images/processed/Vania';

export type Issue = {
	id: number;
	issueId: string;
	name: string;
	summary: string;
	epic_name: string;
	issue_type: string;
	priority: string;
	points: number;
	role: string;
	avatarUrl: string;
};

const avatarMap: Record<string, string> = {
	Alexander,
	Aliza,
	Alvin,
	Angie,
	Arjun,
	Blair,
	Claudia,
	Colin,
	Ed,
	Effie,
	Eliot,
	Fabian,
	Gael,
	Gerard,
	Hasan,
	Helena,
	Ivan,
	Katina,
	Lara,
	Leo,
	Lydia,
	Maribel,
	Milo,
	Myra,
	Narul,
	Norah,
	Oliver,
	Rahul,
	Renato,
	Steve,
	Tanya,
	Tori,
	Vania,
};

const names: string[] = Object.keys(avatarMap);

const roles: string[] = [
	'Engineer',
	'Senior Engineer',
	'Principal Engineer',
	'Engineering Manager',
	'Designer',
	'Senior Designer',
	'Lead Designer',
	'Design Manager',
	'Content Designer',
	'Product Manager',
	'Program Manager',
];

let sharedLookupIndex: number = 0;

/**
 * Note: this does not use randomness so that it is stable for VR tests
 */
export function getIssue(): Issue {
	sharedLookupIndex++;
	return getIssueFromPosition({ position: sharedLookupIndex });
}

const issueSummaries = [
    'Tối ưu hóa hiệu suất API', 
    'Cập nhật giao diện người dùng trang đăng nhập', 
    'Sửa lỗi crash khi tải ảnh', 
    'Thêm tính năng lọc nâng cao',
    'Viết tài liệu cho module thanh toán',
];

const epicNames = [
    'EPIC-Core', 
    'EPIC-UX-Improvements', 
    'EPIC-Performance', 
    'EPIC-Data-Migration',
];

const issueTypes = [
    'bug', 
    'feature', 
    'request', 
    'story',
    'task',
];

const priorities = [
    'highest', 
    'high', 
    'medium', 
    'low', 
    'lowest',
];

const pointsList = [1, 2, 3, 5, 8];

export function getIssueFromPosition({ position }: { position: number }): Issue {
    const name = names[position % names.length];
    const role = roles[position % roles.length];

    const randomSummary = issueSummaries[position % issueSummaries.length];
    const randomEpicName = epicNames[position % epicNames.length];
    const randomIssueType = issueTypes[position % issueTypes.length];
    const randomPriority = priorities[position % priorities.length];
    const randomPoints = pointsList[position % pointsList.length];

    return {
		id: position,
        issueId: `ERP${position}`,
        name,
        summary: randomSummary,
        epic_name: randomEpicName,
        issue_type: randomIssueType,
        priority: randomPriority,
        points: randomPoints,
        role,
        avatarUrl: avatarMap[name],
    };
}

export function getIssuesFromPosition({
	amount,
	startIndex,
}: {
	amount: number;
	startIndex: number;
}): Issue[] {
	return Array.from({ length: amount }, () => getIssueFromPosition({ position: startIndex++ }));
}

export function getIssues({ amount }: { amount: number }): Issue[] {
	return Array.from({ length: amount }, () => getIssue());
}

export type ColumnType = {
	title: string;
	columnId: string;
	items: Issue[];
};
export type ColumnMap = { [columnId: string]: ColumnType };

export function getData({
	columnCount,
	itemsPerColumn,
}: {
	columnCount: number;
	itemsPerColumn: number;
}) {
	const columnMap: ColumnMap = {};

	for (let i = 0; i < columnCount; i++) {
		const column: ColumnType = {
			title: `Column ${i}`,
			columnId: `column-${i}`,
			items: getIssues({ amount: itemsPerColumn }),
		};
		columnMap[column.columnId] = column;
	}
	const orderedColumnIds = Object.keys(columnMap);

	return {
		columnMap,
		orderedColumnIds,
		lastOperation: null,
	};
}

export function getBasicData() {
	sharedLookupIndex = 0;
	const columnMap: ColumnMap = {
		to_do: {
			title: 'To Do',
			columnId: 'to_do',
			items: getIssues({ amount: 10 }),
		},
		in_progress: {
			title: 'In Progress',
			columnId: 'in_progress',
			items: getIssues({ amount: 10 }),
		},
		done: {
			title: 'Done',
			columnId: 'done',
			items: getIssues({ amount: 10 }),
		},
	};

	const orderedColumnIds = ['to_do', 'in_progress', 'done'];

	return {
		columnMap,
		orderedColumnIds,
	};
}

import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { type Issue } from '../../data/people';

// --- CSS Styles (Inline cho đơn giản) ---
// Trong dự án thực tế, bạn nên dùng CSS modules hoặc một thư viện styling.
const modalStyles: React.CSSProperties = {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	backgroundColor: 'rgba(0, 0, 0, 0.6)',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	zIndex: 1000, // Đảm bảo Modal nằm trên mọi thứ
};

const contentStyles: React.CSSProperties = {
	backgroundColor: 'white',
	padding: '24px',
	borderRadius: '8px',
	width: '90%',
	maxWidth: '600px',
	boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
	maxHeight: '80vh',
	overflowY: 'auto',
};

const headerStyles: React.CSSProperties = {
	borderBottom: '1px solid #ebecf0',
	paddingBottom: '16px',
	marginBottom: '16px',
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
};

const closeButtonStyles: React.CSSProperties = {
	background: 'none',
	border: 'none',
	fontSize: '20px',
	cursor: 'pointer',
	color: '#42526e',
};

const footerStyles: React.CSSProperties = {
	borderTop: '1px solid #ebecf0',
	paddingTop: '16px',
	marginTop: '16px',
	textAlign: 'right',
};

const detailRowStyles: React.CSSProperties = {
	display: 'grid',
	gridTemplateColumns: '100px 1fr',
	gap: '16px',
	padding: '8px 0',
	borderBottom: '1px solid #f4f5f7',
};

const labelStyles: React.CSSProperties = {
	color: '#5e6c84', // Màu chữ subtle
	fontWeight: '500',
};

const CustomButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
	<button
		style={{
			padding: '8px 16px',
			borderRadius: '3px',
			border: 'none',
			cursor: 'pointer',
			backgroundColor: '#0052cc',
			color: 'white',
		}}
		{...props}
	>
		{children}
	</button>
);


type IssueDetailModalProps = {
	issue: Issue;
	onClose: () => void;
};

export const IssueDetailModal = ({ issue, onClose }: IssueDetailModalProps) => {
	// Lắng nghe sự kiện click backdrop để đóng modal
	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const modalContent = (
		<div style={modalStyles} onClick={handleBackdropClick}>
			<div style={contentStyles}>
				{/* Header */}
				<div style={headerStyles}>
					<h2 style={{ margin: 0, fontSize: '24px' }}>{issue.summary}</h2>
					<button style={closeButtonStyles} onClick={onClose}>
						&times;
					</button>
				</div>

				{/* Body */}
				<div style={{ padding: '0 8px' }}>
					<div style={detailRowStyles}>
						<span style={labelStyles}>Issue Key:</span>
						<span>{issue.issue_type}-{issue.issueId}</span>

						<span style={labelStyles}>Type:</span>
						<span>{issue.issue_type}</span>
					</div>

					{issue.epic_name && (
						<div style={detailRowStyles}>
							<span style={labelStyles}>Epic:</span>
							<span>{issue.epic_name}</span>
						</div>
					)}

					<div style={{ padding: '8px 0', borderBottom: '1px solid #f4f5f7' }}>
						<p style={{ ...labelStyles, marginBottom: '4px' }}>Description:</p>
						<p style={{ margin: 0 }}>
							{issue.summary} (Đây là mô tả chi tiết của issue.)
						</p>
					</div>
                    
					<div style={detailRowStyles}>
						<span style={labelStyles}>Points:</span>
						<span>{issue.points ?? 'N/A'}</span>

						<span style={labelStyles}>Priority:</span>
						<span>{issue.priority}</span>
					</div>

					<div style={detailRowStyles}>
						<span style={labelStyles}>Assignee:</span>
						<span>{issue.name ?? 'Unassigned'}</span>
					</div>
				</div>

				{/* Footer */}
				<div style={footerStyles}>
					<CustomButton onClick={onClose}>Đóng</CustomButton>
				</div>
			</div>
		</div>
	);

	// Sử dụng Portal để render Modal ra ngoài DOM root, ngăn chặn xung đột styling
	// Nếu bạn đang dùng Create React App hoặc framework tương tự, đảm bảo có #modal-root trong index.html
	const portalRoot = document.getElementById('modal-root');
	if (portalRoot) {
		return ReactDOM.createPortal(modalContent, portalRoot);
	}
	// Fallback nếu không tìm thấy #modal-root (thường là body)
	return ReactDOM.createPortal(modalContent, document.body);
};
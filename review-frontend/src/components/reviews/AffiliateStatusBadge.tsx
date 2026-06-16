'use client'

interface AffiliateStatusBadgeProps {
  status: string | null;
}

const AffiliateStatusBadge = ({ status }: AffiliateStatusBadgeProps) => {
  if (!status) return null;

  const statusConfig: Record<string, { label: string; emoji: string; className: string }> = {
    PENDING_VERIFICATION: {
      label: 'Pending Verification',
      emoji: '🟡',
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    APPROVED: {
      label: 'Approved',
      emoji: '🟢',
      className: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    AUTO_APPROVED: {
      label: 'Approved',
      emoji: '🟢',
      className: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    NEEDS_CHANGES: {
      label: 'Needs Changes',
      emoji: '🟠',
      className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    REJECTED: {
      label: 'Rejected',
      emoji: '🔴',
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
    AUTO_REJECTED: {
      label: 'Rejected',
      emoji: '🔴',
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING_VERIFICATION;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default AffiliateStatusBadge;

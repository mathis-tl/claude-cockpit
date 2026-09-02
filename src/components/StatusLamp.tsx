import "./StatusLamp.css";

interface StatusLampProps {
  status: string;
}

const STATUS_CLASS: Record<string, string> = {
  active: "is-active",
  occasional: "is-occasional",
};

export function StatusLamp({ status }: StatusLampProps) {
  const stateClass = STATUS_CLASS[status] ?? "is-idle";
  return (
    <span className="status-lamp" title={`Statut : ${status}`}>
      <span className={`status-lamp__bulb ${stateClass}`} aria-hidden="true" />
      <span className="status-lamp__label">{status}</span>
    </span>
  );
}

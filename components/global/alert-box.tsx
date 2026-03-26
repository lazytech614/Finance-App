import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ConfirmAlertProps {
  title: string;
  description: string;
  color?: "red" | "green" | "blue" | "yellow";
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmAlert({
  title,
  description,
  color = "red",
  onConfirm,
  onCancel,
}: ConfirmAlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const colorMap: Record<string, string> = {
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    yellow: "bg-yellow-50 text-yellow-700",
  };

  const btnColorMap: Record<string, string> = {
    red: "bg-red-600 hover:bg-red-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <Card className={`w-100 ${colorMap[color]} border border-current`}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end gap-2 mt-2">
          <Button
            variant="outline"
            onClick={() => {
              setVisible(false);
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button
            className={btnColorMap[color]}
            onClick={() => {
              setVisible(false);
              onConfirm();
            }}
          >
            Confirm
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
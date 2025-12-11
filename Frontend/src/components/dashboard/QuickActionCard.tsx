import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "primary" | "secondary" | "success";
  onClick?: () => void;
}

const QuickActionCard = ({ title, description, icon: Icon, color, onClick }: QuickActionCardProps) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary hover:bg-primary/20",
    secondary: "bg-secondary/10 text-secondary hover:bg-secondary/20",
    success: "bg-success/10 text-success hover:bg-success/20",
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionCard;

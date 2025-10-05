'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LockIcon } from 'lucide-react';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  featureName: string;
  price?: string;
  benefits: string[];
  onUpgrade?: () => void;
  isLocked?: boolean;
}

export default function PremiumFeatureCard({
  title,
  description,
  icon,
  featureName,
  price = "Pro Feature",
  benefits,
  onUpgrade,
  isLocked = true
}: PremiumFeatureCardProps) {
  return (
    <Card className="relative border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
      {isLocked && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-primary/20 text-primary">
            <LockIcon className="h-3 w-3 mr-1" />
            {price}
          </Badge>
        </div>
      )}

      <CardHeader>
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-primary/20 mr-3">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2 text-primary">Premium Benefits:</h4>
          <ul className="space-y-1">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start text-sm">
                <span className="text-primary mr-2">•</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {isLocked && (
          <div className="pt-4 border-t border-primary/20">
            <Button 
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Upgrade for {featureName}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Unlock with Professional or Enterprise plan
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
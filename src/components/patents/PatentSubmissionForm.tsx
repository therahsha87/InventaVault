'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, FileText, User, Mail } from 'lucide-react';
import type { PatentIdea } from '@/types/patent';

interface PatentSubmissionFormProps {
  onSubmit: (idea: PatentIdea) => void;
  loading?: boolean;
}

export function PatentSubmissionForm({ onSubmit, loading }: PatentSubmissionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technicalField: '',
    problemSolved: '',
    solution: '',
    advantages: '',
    submitterName: '',
    submitterEmail: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Patent title is required';
    if (!formData.description.trim()) newErrors.description = 'Patent description is required';
    if (!formData.technicalField.trim()) newErrors.technicalField = 'Technical field is required';
    if (!formData.problemSolved.trim()) newErrors.problemSolved = 'Problem description is required';
    if (!formData.solution.trim()) newErrors.solution = 'Solution description is required';
    if (!formData.advantages.trim()) newErrors.advantages = 'Advantages description is required';
    if (!formData.submitterName.trim()) newErrors.submitterName = 'Your name is required';
    if (!formData.submitterEmail.trim()) {
      newErrors.submitterEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submitterEmail)) {
      newErrors.submitterEmail = 'Valid email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const patentIdea: PatentIdea = {
      ...formData,
      createdAt: new Date()
    };

    onSubmit(patentIdea);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Lightbulb className="h-8 w-8 text-indigo-600 mr-2" />
          <CardTitle className="text-3xl font-bold text-gray-900">Submit Your Patent Idea</CardTitle>
        </div>
        <CardDescription className="text-lg text-gray-600">
          Describe your invention and we'll research prior art, generate legal documentation, and record it on the blockchain
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="submitterName" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2" />
                Your Full Name *
              </Label>
              <Input
                id="submitterName"
                type="text"
                value={formData.submitterName}
                onChange={(e) => handleInputChange('submitterName', e.target.value)}
                placeholder="Enter your full legal name"
                className={errors.submitterName ? 'border-red-500' : ''}
              />
              {errors.submitterName && <p className="text-red-500 text-sm mt-1">{errors.submitterName}</p>}
            </div>

            <div>
              <Label htmlFor="submitterEmail" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Mail className="h-4 w-4 mr-2" />
                Email Address *
              </Label>
              <Input
                id="submitterEmail"
                type="email"
                value={formData.submitterEmail}
                onChange={(e) => handleInputChange('submitterEmail', e.target.value)}
                placeholder="your.email@example.com"
                className={errors.submitterEmail ? 'border-red-500' : ''}
              />
              {errors.submitterEmail && <p className="text-red-500 text-sm mt-1">{errors.submitterEmail}</p>}
            </div>
          </div>

          {/* Patent Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Patent Title *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., 'Smart Home Energy Management System'"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="technicalField" className="text-sm font-semibold text-gray-700 mb-2">
                Technical Field *
              </Label>
              <Input
                id="technicalField"
                type="text"
                value={formData.technicalField}
                onChange={(e) => handleInputChange('technicalField', e.target.value)}
                placeholder="e.g., 'Internet of Things, Home Automation, Energy Management'"
                className={errors.technicalField ? 'border-red-500' : ''}
              />
              {errors.technicalField && <p className="text-red-500 text-sm mt-1">{errors.technicalField}</p>}
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2">
                Detailed Description of Your Invention *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a comprehensive description of your invention, including how it works, its components, and its functionality..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <Label htmlFor="problemSolved" className="text-sm font-semibold text-gray-700 mb-2">
                Problem Your Invention Solves *
              </Label>
              <Textarea
                id="problemSolved"
                value={formData.problemSolved}
                onChange={(e) => handleInputChange('problemSolved', e.target.value)}
                placeholder="Describe the specific problem or need that your invention addresses..."
                rows={3}
                className={errors.problemSolved ? 'border-red-500' : ''}
              />
              {errors.problemSolved && <p className="text-red-500 text-sm mt-1">{errors.problemSolved}</p>}
            </div>

            <div>
              <Label htmlFor="solution" className="text-sm font-semibold text-gray-700 mb-2">
                How Your Invention Solves the Problem *
              </Label>
              <Textarea
                id="solution"
                value={formData.solution}
                onChange={(e) => handleInputChange('solution', e.target.value)}
                placeholder="Explain the specific methods, techniques, or approaches your invention uses to solve the problem..."
                rows={3}
                className={errors.solution ? 'border-red-500' : ''}
              />
              {errors.solution && <p className="text-red-500 text-sm mt-1">{errors.solution}</p>}
            </div>

            <div>
              <Label htmlFor="advantages" className="text-sm font-semibold text-gray-700 mb-2">
                Advantages and Benefits *
              </Label>
              <Textarea
                id="advantages"
                value={formData.advantages}
                onChange={(e) => handleInputChange('advantages', e.target.value)}
                placeholder="List the key advantages, benefits, and improvements your invention provides over existing solutions..."
                rows={3}
                className={errors.advantages ? 'border-red-500' : ''}
              />
              {errors.advantages && <p className="text-red-500 text-sm mt-1">{errors.advantages}</p>}
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Processing Fee:</strong> A nominal fee of 0.001 ETH (~$2-3) or 5 USDC will be charged for patent processing, prior art research, and blockchain recording.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold"
          >
            {loading ? 'Processing Your Patent...' : 'Start Patent Process'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

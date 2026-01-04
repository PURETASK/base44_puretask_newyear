// AI Photo Quality Validation Service
// Automatically validates photo quality using AI vision analysis

import { base44 } from '@/api/base44Client';

export interface PhotoQualityResult {
  score: number; // 0-100
  passed: boolean;
  issues: string[];
  suggestions: string[];
  analysis: {
    brightness: 'good' | 'too_dark' | 'too_bright';
    blur: 'sharp' | 'slightly_blurry' | 'too_blurry';
    framing: 'good' | 'poor' | 'cropped';
    relevance: 'relevant' | 'unclear' | 'irrelevant';
  };
}

export class PhotoQualityService {
  
  // Validate a single photo
  async validatePhoto(
    photoFile: File,
    photoType: 'before' | 'after',
    jobContext?: {
      cleaningType: string;
      room?: string;
    }
  ): Promise<PhotoQualityResult> {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(photoFile);
      
      // Build prompt for AI vision analysis
      const prompt = this.buildValidationPrompt(photoType, jobContext);
      
      // Call Base44 LLM with vision capabilities
      const response = await base44.integrations.Core.InvokeLLM({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional cleaning photo quality validator. Analyze photos and provide structured feedback.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: base64 } }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });
      
      // Parse AI response
      const analysis = this.parseAIResponse(response.choices[0].message.content);
      
      return analysis;
    } catch (error) {
      console.error('Photo validation error:', error);
      // Fallback to basic validation
      return this.basicValidation(photoFile);
    }
  }
  
  // Build validation prompt based on photo type
  private buildValidationPrompt(
    photoType: 'before' | 'after',
    context?: { cleaningType: string; room?: string }
  ): string {
    const basePrompt = `Analyze this ${photoType} cleaning photo and evaluate:
    
1. **Brightness**: Is the photo well-lit and clear?
2. **Blur**: Is the photo sharp and in focus?
3. **Framing**: Does it show the relevant area clearly?
4. **Relevance**: Does it show cleaning progress/results?

${photoType === 'before' ? `
This is a BEFORE photo. Look for:
- Clear view of the area before cleaning
- Visible dirt, mess, or items to be cleaned
- Good angle showing the overall space
` : `
This is an AFTER photo. Look for:
- Clear view of the cleaned area
- Visible cleaning results
- Good comparison potential with before photos
`}

${context ? `Context: ${context.cleaningType} cleaning${context.room ? ` in ${context.room}` : ''}` : ''}

Respond in JSON format:
{
  "score": 0-100,
  "passed": true/false,
  "issues": ["issue 1", "issue 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "brightness": "good|too_dark|too_bright",
  "blur": "sharp|slightly_blurry|too_blurry",
  "framing": "good|poor|cropped",
  "relevance": "relevant|unclear|irrelevant"
}`;

    return basePrompt;
  }
  
  // Parse AI response into structured result
  private parseAIResponse(aiResponse: string): PhotoQualityResult {
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        score: parsed.score || 0,
        passed: parsed.passed || parsed.score >= 70,
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || [],
        analysis: {
          brightness: parsed.brightness || 'good',
          blur: parsed.blur || 'sharp',
          framing: parsed.framing || 'good',
          relevance: parsed.relevance || 'relevant'
        }
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.createDefaultResult();
    }
  }
  
  // Basic validation without AI (fallback)
  private async basicValidation(photoFile: File): Promise<PhotoQualityResult> {
    const sizeKB = photoFile.size / 1024;
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;
    
    // Check file size
    if (sizeKB < 100) {
      issues.push('Photo resolution may be too low');
      suggestions.push('Take photo in higher quality mode');
      score -= 30;
    }
    
    if (sizeKB > 10000) {
      issues.push('Photo file size is very large');
      suggestions.push('Photo will take longer to upload');
      score -= 10;
    }
    
    // Check dimensions
    try {
      const dimensions = await this.getImageDimensions(photoFile);
      if (dimensions.width < 640 || dimensions.height < 480) {
        issues.push('Image dimensions are small');
        suggestions.push('Use a camera with higher resolution');
        score -= 20;
      }
    } catch (error) {
      // Couldn't get dimensions
    }
    
    return {
      score,
      passed: score >= 70,
      issues,
      suggestions,
      analysis: {
        brightness: 'good',
        blur: 'sharp',
        framing: 'good',
        relevance: 'relevant'
      }
    };
  }
  
  // Batch validate multiple photos
  async validateBatch(
    photos: File[],
    photoType: 'before' | 'after',
    jobContext?: { cleaningType: string }
  ): Promise<PhotoQualityResult[]> {
    const results = await Promise.all(
      photos.map(photo => this.validatePhoto(photo, photoType, jobContext))
    );
    return results;
  }
  
  // Get overall quality score for a set of photos
  getOverallScore(results: PhotoQualityResult[]): {
    avgScore: number;
    allPassed: boolean;
    totalIssues: number;
  } {
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const allPassed = results.every(r => r.passed);
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    
    return { avgScore, allPassed, totalIssues };
  }
  
  // Generate improvement tips based on common issues
  generateImprovementTips(results: PhotoQualityResult[]): string[] {
    const allIssues = results.flatMap(r => r.issues);
    const tips: string[] = [];
    
    if (allIssues.some(i => i.includes('dark'))) {
      tips.push('💡 Turn on more lights or open curtains for better brightness');
    }
    
    if (allIssues.some(i => i.includes('blur'))) {
      tips.push('📸 Hold your phone steady and tap to focus before taking the photo');
    }
    
    if (allIssues.some(i => i.includes('framing') || i.includes('cropped'))) {
      tips.push('🎯 Step back a bit to show more of the area in frame');
    }
    
    if (allIssues.some(i => i.includes('relevance') || i.includes('unclear'))) {
      tips.push('✨ Focus on areas that show cleaning progress or results');
    }
    
    return tips;
  }
  
  // Helper: Convert file to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  // Helper: Get image dimensions
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Helper: Create default result
  private createDefaultResult(): PhotoQualityResult {
    return {
      score: 70,
      passed: true,
      issues: [],
      suggestions: [],
      analysis: {
        brightness: 'good',
        blur: 'sharp',
        framing: 'good',
        relevance: 'relevant'
      }
    };
  }
}

// Singleton instance
export const photoQualityService = new PhotoQualityService();

// React Hook for photo validation
export function usePhotoValidation() {
  const [validating, setValidating] = React.useState(false);
  const [results, setResults] = React.useState<PhotoQualityResult[]>([]);
  
  const validatePhoto = async (
    file: File,
    type: 'before' | 'after',
    context?: { cleaningType: string }
  ) => {
    setValidating(true);
    try {
      const result = await photoQualityService.validatePhoto(file, type, context);
      setResults(prev => [...prev, result]);
      return result;
    } finally {
      setValidating(false);
    }
  };
  
  const clearResults = () => setResults([]);
  
  return {
    validatePhoto,
    validating,
    results,
    clearResults,
    overallScore: photoQualityService.getOverallScore(results),
    improvementTips: photoQualityService.generateImprovementTips(results)
  };
}


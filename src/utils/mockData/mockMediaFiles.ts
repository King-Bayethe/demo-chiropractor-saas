export interface MediaFile {
  id: string;
  filename: string;
  originalFilename: string;
  fileType: 'image' | 'document' | 'video' | 'audio' | 'other';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  tags: string[];
  folder?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  description?: string;
}

export const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    filename: 'patient-xray-001.jpg',
    originalFilename: 'xray_smith_spine_2024.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    size: 2456789,
    url: '/media/patient-xray-001.jpg',
    thumbnailUrl: '/media/thumbnails/patient-xray-001.jpg',
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user1',
    uploadedByName: 'Dr. Sarah Johnson',
    tags: ['x-ray', 'spine', 'patient-imaging'],
    folder: 'Patient Images',
    dimensions: { width: 2048, height: 1536 },
    description: 'Lumbar spine x-ray for John Smith'
  },
  {
    id: '2',
    filename: 'clinic-logo-2024.png',
    originalFilename: 'logo_final.png',
    fileType: 'image',
    mimeType: 'image/png',
    size: 156789,
    url: '/media/clinic-logo-2024.png',
    thumbnailUrl: '/media/thumbnails/clinic-logo-2024.png',
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user3',
    uploadedByName: 'Lisa Martinez',
    tags: ['branding', 'logo', 'marketing'],
    folder: 'Marketing',
    dimensions: { width: 1000, height: 1000 },
    description: 'Official clinic logo 2024'
  },
  {
    id: '3',
    filename: 'patient-consent-form.pdf',
    originalFilename: 'consent_form_template_v3.pdf',
    fileType: 'document',
    mimeType: 'application/pdf',
    size: 345678,
    url: '/media/patient-consent-form.pdf',
    uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user1',
    uploadedByName: 'Dr. Sarah Johnson',
    tags: ['forms', 'consent', 'legal'],
    folder: 'Documents/Forms',
    description: 'Standard patient consent form'
  },
  {
    id: '4',
    filename: 'exercise-demo-video.mp4',
    originalFilename: 'stretching_exercises_final.mp4',
    fileType: 'video',
    mimeType: 'video/mp4',
    size: 15678901,
    url: '/media/exercise-demo-video.mp4',
    thumbnailUrl: '/media/thumbnails/exercise-demo-video.jpg',
    uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user2',
    uploadedByName: 'Dr. Michael Chen',
    tags: ['exercise', 'education', 'patient-resources'],
    folder: 'Patient Education',
    dimensions: { width: 1920, height: 1080 },
    duration: 245,
    description: 'Home stretching exercise demonstrations'
  },
  {
    id: '5',
    filename: 'clinic-tour-photo-1.jpg',
    originalFilename: 'IMG_5432.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    size: 3456789,
    url: '/media/clinic-tour-photo-1.jpg',
    thumbnailUrl: '/media/thumbnails/clinic-tour-photo-1.jpg',
    uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user3',
    uploadedByName: 'Lisa Martinez',
    tags: ['clinic', 'photos', 'facilities'],
    folder: 'Marketing',
    dimensions: { width: 4032, height: 3024 },
    description: 'Main treatment room'
  },
  {
    id: '6',
    filename: 'insurance-policy-guide.pdf',
    originalFilename: 'insurance_guide_2024.pdf',
    fileType: 'document',
    mimeType: 'application/pdf',
    size: 567890,
    url: '/media/insurance-policy-guide.pdf',
    uploadedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user4',
    uploadedByName: 'James Wilson',
    tags: ['insurance', 'billing', 'reference'],
    folder: 'Documents/Insurance',
    description: 'Insurance policy reference guide'
  },
  {
    id: '7',
    filename: 'patient-testimonial-audio.mp3',
    originalFilename: 'testimonial_rodriguez.mp3',
    fileType: 'audio',
    mimeType: 'audio/mpeg',
    size: 2345678,
    url: '/media/patient-testimonial-audio.mp3',
    uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user3',
    uploadedByName: 'Lisa Martinez',
    tags: ['testimonial', 'marketing', 'audio'],
    folder: 'Marketing',
    duration: 180,
    description: 'Patient testimonial - Emily Rodriguez'
  },
  {
    id: '8',
    filename: 'mri-scan-chen-001.jpg',
    originalFilename: 'mri_chen_20240215.jpg',
    fileType: 'image',
    mimeType: 'image/jpeg',
    size: 4567890,
    url: '/media/mri-scan-chen-001.jpg',
    thumbnailUrl: '/media/thumbnails/mri-scan-chen-001.jpg',
    uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user2',
    uploadedByName: 'Dr. Michael Chen',
    tags: ['mri', 'imaging', 'diagnostics'],
    folder: 'Patient Images',
    dimensions: { width: 1024, height: 1024 },
    description: 'MRI scan - cervical spine'
  },
  {
    id: '9',
    filename: 'staff-training-manual.pdf',
    originalFilename: 'training_manual_v5.pdf',
    fileType: 'document',
    mimeType: 'application/pdf',
    size: 1234567,
    url: '/media/staff-training-manual.pdf',
    uploadedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user1',
    uploadedByName: 'Dr. Sarah Johnson',
    tags: ['training', 'staff', 'procedures'],
    folder: 'Documents/Training',
    description: 'Complete staff training manual'
  },
  {
    id: '10',
    filename: 'posture-infographic.png',
    originalFilename: 'posture_tips_infographic.png',
    fileType: 'image',
    mimeType: 'image/png',
    size: 789012,
    url: '/media/posture-infographic.png',
    thumbnailUrl: '/media/thumbnails/posture-infographic.png',
    uploadedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    uploadedBy: 'user2',
    uploadedByName: 'Dr. Michael Chen',
    tags: ['education', 'infographic', 'posture'],
    folder: 'Patient Education',
    dimensions: { width: 1200, height: 1800 },
    description: 'Proper posture tips infographic'
  }
];

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Check, AlertCircle, Upload, User, Users, Calendar, Plane, Building, Loader2, Hotel, Home, MapPin, Star } from 'lucide-react';
import { Guest, CMSSettings, ScheduleEvent, ScheduleDay } from '../types';

interface RegistrationProps {
  onBack: () => void;
  onComplete: () => void;
  settings: CMSSettings;
  syncToCMS: (data: Partial<Guest>) => void;
  schedule?: ScheduleDay[];
  formConfig?: {
    flights?: Array<{ id: string; labelEn: string; labelZh: string; descriptionEn?: string; descriptionZh?: string }>;
    hotels?: Array<{ id: string; labelEn: string; labelZh: string; icon?: string }>;
    roomTypes?: Array<{ id: string; labelEn: string; labelZh: string }>;
    dietaryOptions?: Array<{ id: string; labelEn: string; labelZh: string }>;
    events?: Array<{ 
      id: string; 
      labelEn: string; 
      labelZh: string; 
      date?: string; 
      time?: string; 
      fullLabel?: string;
    }>;
  };
}

const steps = [
  { id: 1, title: "Terms & Conditions", titleZh: "條款與條件" },
  { id: 2, title: "Personal Profile", titleZh: "個人資料" },
  { id: 3, title: "Flight Selection", titleZh: "航班選擇" },
  { id: 4, title: "Hotel & Pairing", titleZh: "酒店與配對" },
  { id: 5, title: "Event Selection", titleZh: "活動選擇" },
  { id: 6, title: "Dietary & Special", titleZh: "飲食與特殊需求" },
  { id: 7, title: "Confirmation", titleZh: "確認" },
];

export const Registration: React.FC<RegistrationProps> = ({ onBack, onComplete, settings, syncToCMS, schedule = [], formConfig }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [toastMessage, setToastMessage] = useState<{type: 'success'|'error', msg: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nameZh: "", lastNameEn: "", firstNameEn: "", gender: "", dob: "", mobile: "", email: "", passportNumber: "",
    passportUrl: "",
    flightOption: "",
    hotelOption: "",
    roomType: "Single" as "Single" | "Twin",
    roommateName: "",
    selectedEventIds: [] as string[],
    dietaryRestrictions: "",
    specialRemarks: ""
  });

  // 選修活動從 formConfig.events 獲取，不是從 schedule
  const selectableEvents = formConfig?.events || [];

  const showToast = (type: 'success' | 'error', msg: string) => {
      setToastMessage({ type, msg });
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const maxSize = 5 * 1024 * 1024; // 5MB
          
          if (file.size > maxSize) {
              showToast('error', 'File size too large. Please upload an image smaller than 5MB. (檔案太大，請上傳小於 5MB 的圖片)');
              return;
          }

          const reader = new FileReader();
          reader.onload = (ev) => {
              const result = ev.target?.result as string;
              
              // 壓縮圖片
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const maxWidth = 1920;
                  const maxHeight = 1080;
                  let width = img.width;
                  let height = img.height;

                  // 計算縮放比例
                  if (width > height) {
                      if (width > maxWidth) {
                          height = (height * maxWidth) / width;
                          width = maxWidth;
                      }
                  } else {
                      if (height > maxHeight) {
                          width = (width * maxHeight) / height;
                          height = maxHeight;
                      }
                  }

                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                      ctx.drawImage(img, 0, 0, width, height);
                      // 使用較低的質量來減少文件大小
                      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                      setFormData({...formData, passportUrl: compressedDataUrl});
                      showToast('success', 'Passport uploaded successfully (護照上傳成功)');
                  }
              };
              img.onerror = () => {
                  showToast('error', 'Failed to load image. Please try again. (圖片載入失敗，請重試)');
              };
              img.src = result;
          };
          reader.readAsDataURL(file);
      }
  };

  const toggleEventSelection = (eventId: string) => {
      setFormData(prev => {
          const exists = prev.selectedEventIds.includes(eventId);
          if (exists) {
              return { ...prev, selectedEventIds: prev.selectedEventIds.filter(id => id !== eventId) };
          } else {
              return { ...prev, selectedEventIds: [...prev.selectedEventIds, eventId] };
          }
      });
  };

  const handleNext = () => {
    if (currentStep === 1 && !agreedToTerms) {
      showToast('error', "Please agree to Terms & Conditions");
      return;
    }
    
    if (currentStep === 2) {
        if (!formData.lastNameEn || !formData.firstNameEn || !formData.email || !formData.passportUrl) {
             showToast('error', "Please complete all fields and upload passport");
             return;
        }
    }

    if (currentStep === 4 && formData.roomType === 'Twin' && !formData.roommateName) {
         showToast('error', "Please enter your preferred roommate's name");
         return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    } else {
        onBack();
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // 防止重複提交
    
    try {
      setIsSubmitting(true);
      
      // 先同步到 CMS
      await syncToCMS({
        nameEn: `${formData.firstNameEn} ${formData.lastNameEn}`,
        nameZh: formData.nameZh,
        email: formData.email,
        mobile: formData.mobile,
        dob: formData.dob,
        passportNumber: formData.passportNumber,
        passportUrl: formData.passportUrl,
        flight: formData.flightOption === 'A' ? 'Group Flight' : 'Self',
        hotel: formData.hotelOption,
        roomType: formData.roomType,
        roommate: formData.roommateName,
        selectedEventIds: formData.selectedEventIds,
        dietary: formData.dietaryRestrictions,
        specialRemarks: formData.specialRemarks,
        status: 'Registered'
      });
      
      showToast('success', "Registration Successful! (登記成功！)");
      
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      setIsSubmitting(false); // 失敗時允許重試
      showToast('error', "Registration failed. Please try again. (登記失敗，請重試)");
      console.error('Registration error:', error);
    }
  };

  const renderInput = (labelEn: string, labelZh: string, key: keyof typeof formData, placeholder: string = "", type: string = "text") => (
    <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">
          {labelEn} {labelZh && <span className="text-gray-500 font-normal">({labelZh})</span>}
        </label>
        <input 
            type={type}
            value={formData[key] as string}
            onChange={(e) => setFormData({...formData, [key]: e.target.value})}
            placeholder={placeholder}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
        />
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
        case 1:
            return (
                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm text-gray-600 leading-relaxed h-96 overflow-y-auto">
                        <h4 className="font-bold text-gray-800 mb-2">1. INCENTIVE TRIP TERMS</h4>
                        <p className="mb-4">By registering for this trip, you agree to the following terms set forth by the Insurance Company.</p>
                        
                        <h4 className="font-bold text-gray-800 mb-2">2. CANCELLATION POLICY</h4>
                        <p className="mb-4">Any cancellation made less than 30 days prior to departure will incur a 100% penalty fee deducted from your agency commission.</p>
                        
                        <h4 className="font-bold text-gray-800 mb-2">3. TRAVEL DOCUMENTS</h4>
                        <p className="mb-4">You are responsible for obtaining a valid visa (ETA) for Australia. Passport must be valid for 6 months beyond travel date.</p>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-5 h-5 text-red-500 rounded focus:ring-red-500 border-gray-300"
                        />
                        <label htmlFor="terms" className="text-sm font-medium text-gray-700 cursor-pointer">
                            I have read and agree to the Terms & Conditions (我已閱讀並同意條款與條件)
                        </label>
                    </div>
                </div>
            );
        case 2:
            return (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
                         <User className="text-blue-500 mt-1" size={20} />
                         <div className="text-sm text-blue-800">Please match details exactly as they appear on your passport. (請確保資料與護照上的完全一致)</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {renderInput("Last Name", "姓氏", "lastNameEn")}
                        {renderInput("First Name", "名字", "firstNameEn")}
                    </div>
                    {renderInput("Chinese Name", "中文姓名", "nameZh")}
                    
                    <div className="space-y-2 pt-2">
                        <label className="block text-sm font-bold text-gray-700">Passport Copy (Upload) <span className="text-gray-500 font-normal">(護照副本上傳)</span></label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-red-400 transition"
                        >
                            {formData.passportUrl ? (
                                <div className="text-center">
                                    <img src={formData.passportUrl} alt="passport preview" className="h-24 w-auto object-contain mb-2 rounded border" />
                                    <span className="text-green-600 text-xs font-bold flex items-center justify-center"><Check size={12} className="mr-1"/> Uploaded (已上傳)</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="text-gray-400 mb-2" size={24} />
                                    <span className="text-sm text-gray-500">Tap to upload Passport Page (點擊上傳護照頁面)</span>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePassportUpload} />
                        </div>
                    </div>

                    {renderInput("Date of Birth", "出生日期", "dob", "YYYY-MM-DD", "date")}
                    {renderInput("Mobile Number", "手機號碼", "mobile")}
                    {renderInput("Email Address", "電郵地址", "email", "", "email")}
                    {renderInput("Passport No.", "護照號碼", "passportNumber")}
                </div>
            );
        case 3:
            const flights = formConfig?.flights || [
              { id: 'A', labelEn: 'Group Flight (Recommended)', labelZh: '團體航班 (推薦)', descriptionEn: 'CX105 HKG-MEL / CX104 MEL-HKG', descriptionZh: 'CX105 HKG-MEL / CX104 MEL-HKG' },
              { id: 'B', labelEn: 'Self Arrangement', labelZh: '自行安排', descriptionEn: 'Flight allowance will be reimbursed', descriptionZh: '航班津貼將獲退還' },
            ];
            return (
                <div className="space-y-4 animate-fade-in">
                    {flights.map((flight) => (
                        <div 
                            key={flight.id}
                            className="p-4 border rounded-xl cursor-pointer hover:border-red-500 transition-colors relative overflow-hidden" 
                            onClick={() => setFormData({...formData, flightOption: flight.id})}
                        >
                            <div className={`absolute inset-0 bg-red-50 transition-opacity ${formData.flightOption === flight.id ? 'opacity-100' : 'opacity-0'}`}></div>
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-gray-800 flex items-center">
                                        <Plane size={16} className="mr-2"/> 
                                        {flight.labelEn} <span className="text-gray-500 font-normal ml-2">({flight.labelZh})</span>
                                    </div>
                                    {(flight.descriptionEn || flight.descriptionZh) && (
                                        <div className="text-xs text-gray-500 mt-1 ml-6">
                                            {flight.descriptionEn} {flight.descriptionZh && `(${flight.descriptionZh})`}
                                        </div>
                                    )}
                                </div>
                                {formData.flightOption === flight.id && <Check className="text-red-500" size={20}/>}
                            </div>
                        </div>
                    ))}
                </div>
            );
        case 4:
            const hotels = formConfig?.hotels || [
              { id: 'Hyatt', labelEn: 'Grand Hyatt Melbourne', labelZh: '墨爾本君悅酒店' },
              { id: 'Langham', labelEn: 'The Langham Melbourne', labelZh: '墨爾本朗廷酒店' },
            ];
            const roomTypes = formConfig?.roomTypes || [
              { id: 'Single', labelEn: 'Single Room', labelZh: '單人房' },
              { id: 'Twin', labelEn: 'Twin Share', labelZh: '雙人房' },
            ];
            return (
                <div className="space-y-6 animate-fade-in">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Hotel <span className="text-gray-500 font-normal">(選擇酒店)</span></label>
                        {hotels.map((hotel) => {
                            // 根據 icon 字段選擇對應的 icon，默認使用 Building
                            const getHotelIcon = () => {
                                const iconName = hotel.icon?.toLowerCase() || 'building';
                                const iconProps = { size: 16, className: "mr-2" };
                                switch (iconName) {
                                    case 'hotel':
                                        return <Hotel {...iconProps} />;
                                    case 'home':
                                        return <Home {...iconProps} />;
                                    case 'mappin':
                                    case 'map-pin':
                                    case 'location':
                                        return <MapPin {...iconProps} />;
                                    case 'star':
                                        return <Star {...iconProps} />;
                                    case 'building':
                                    default:
                                        return <Building {...iconProps} />;
                                }
                            };
                            
                            return (
                                <div 
                                    key={hotel.id}
                                    className="p-4 border rounded-xl cursor-pointer hover:border-red-500 transition-colors relative overflow-hidden mb-2" 
                                    onClick={() => setFormData({...formData, hotelOption: hotel.id})}
                                >
                                    <div className={`absolute inset-0 bg-red-50 transition-opacity ${formData.hotelOption === hotel.id ? 'opacity-100' : 'opacity-0'}`}></div>
                                    <div className="relative z-10">
                                        <div className="font-bold text-gray-800 flex items-center">
                                            {getHotelIcon()}
                                            {hotel.labelEn} <span className="text-gray-500 font-normal ml-2">({hotel.labelZh})</span>
                                        </div>
                                        {formData.hotelOption === hotel.id && <Check className="text-red-500 absolute top-4 right-4" size={20}/>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t pt-4"></div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Room Arrangement <span className="text-gray-500 font-normal">(房間安排)</span></label>
                        <div className="flex space-x-4 mb-4">
                            {roomTypes.map((roomType) => (
                                <button 
                                    key={roomType.id}
                                    onClick={() => setFormData({...formData, roomType: roomType.id as "Single" | "Twin"})}
                                    className={`flex-1 py-3 px-4 rounded-xl border flex flex-col items-center justify-center space-y-1 ${formData.roomType === roomType.id ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white text-gray-600'}`}
                                >
                                    {roomType.id === 'Single' ? <User size={20} /> : <Users size={20} />}
                                    <span className="text-xs font-bold">
                                        {roomType.labelEn} <span className="text-gray-500 font-normal">({roomType.labelZh})</span>
                                    </span>
                                </button>
                            ))}
                        </div>

                        {formData.roomType === 'Twin' && (
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-slide-down">
                                 <label className="block text-xs font-bold text-gray-500 mb-2">Preferred Roommate Name <span className="text-gray-400 font-normal">(首選室友姓名)</span></label>
                                 <input 
                                    value={formData.roommateName}
                                    onChange={(e) => setFormData({...formData, roommateName: e.target.value})}
                                    placeholder="Enter colleague's name"
                                    className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm focus:border-red-500 outline-none"
                                 />
                                 <p className="text-[10px] text-gray-400 mt-2">If left blank, a roommate will be assigned to you. (如留空，將為您分配室友)</p>
                             </div>
                        )}
                    </div>
                </div>
            );
        case 5:
            // 從 formConfig.events 獲取選修活動列表（不是從 schedule）
            const optionalEvents = formConfig?.events || [];
            
            return (
                <div className="space-y-4 animate-fade-in">
                    <p className="text-sm text-gray-600 mb-2">Select the optional activities you wish to attend. <span className="text-gray-500">(選擇您希望參加的選修活動)</span></p>
                    
                    {optionalEvents.length === 0 ? (
                        <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl">No optional events available for registration at this time. (目前沒有可登記的選修活動)</div>
                    ) : (
                        optionalEvents.map(evt => {
                            const isSelected = formData.selectedEventIds.includes(evt.id);
                            return (
                                <div 
                                    key={evt.id} 
                                    onClick={() => toggleEventSelection(evt.id)}
                                    className={`p-4 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-red-500 bg-red-50 ring-1 ring-red-200' : 'bg-white hover:border-gray-300'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-800 text-sm mb-1">
                                                {evt.labelZh || evt.labelEn || 'Event'}
                                                {evt.labelEn && evt.labelZh !== evt.labelEn && (
                                                    <span className="text-gray-500 font-normal ml-2">({evt.labelEn})</span>
                                                )}
                                            </div>
                                            {(evt.date || evt.time) && (
                                                <div className="text-xs text-gray-500 flex items-center">
                                                    <Calendar size={12} className="mr-1"/> 
                                                    {evt.date || ''} {evt.time ? `• ${evt.time}` : ''}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                                            {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            );
        case 6:
            const dietaryOptions = formConfig?.dietaryOptions || [
              { id: 'None', labelEn: 'None', labelZh: '無' },
              { id: 'Vegetarian', labelEn: 'Vegetarian', labelZh: '素食' },
              { id: 'No Beef', labelEn: 'No Beef', labelZh: '不吃牛肉' },
              { id: 'No Pork', labelEn: 'No Pork', labelZh: '不吃豬肉' },
              { id: 'Halal', labelEn: 'Halal', labelZh: '清真' },
              { id: 'Gluten Free', labelEn: 'Gluten Free', labelZh: '無麩質' },
            ];
            return (
                <div className="space-y-4 animate-fade-in">
                    <label className="block text-sm font-bold text-gray-700">Dietary Requirements <span className="text-gray-500 font-normal">(飲食需求)</span></label>
                    <div className="grid grid-cols-2 gap-3">
                        {dietaryOptions.map((opt) => (
                             <button 
                                key={opt.id}
                                onClick={() => setFormData({...formData, dietaryRestrictions: opt.id})}
                                className={`py-3 px-4 rounded-xl border text-sm text-left ${formData.dietaryRestrictions === opt.id ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'bg-white border-gray-200 text-gray-600'}`}
                            >
                                {opt.labelEn} <span className="text-gray-500">({opt.labelZh})</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2 mt-6">
                        <label className="block text-sm font-bold text-gray-700">Special Remarks <span className="text-gray-500 font-normal">(特殊備註)</span></label>
                        <textarea 
                            value={formData.specialRemarks}
                            onChange={(e) => setFormData({...formData, specialRemarks: e.target.value})}
                            placeholder="Any medical conditions or other requests... (任何醫療狀況或其他要求...)"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all h-32 resize-none"
                        />
                    </div>
                </div>
            );
        case 7:
            const selectedFlight = formConfig?.flights?.find(f => f.id === formData.flightOption) || 
                (formData.flightOption === 'A' ? { labelEn: 'Group Flight', labelZh: '團體航班' } : { labelEn: 'Self Arrangement', labelZh: '自行安排' });
            const selectedHotel = formConfig?.hotels?.find(h => h.id === formData.hotelOption);
            const selectedDietary = formConfig?.dietaryOptions?.find(d => d.id === formData.dietaryRestrictions);
            
            // 獲取選中的活動完整信息（從 formConfig.events）
            const selectedEvents = formData.selectedEventIds.map(id => {
                const configEvent = formConfig?.events?.find(e => e.id === id);
                if (configEvent) {
                    return {
                        id: id,
                        fullLabel: configEvent.fullLabel || `${configEvent.date || ''} ${configEvent.time || ''} - ${configEvent.labelZh || configEvent.labelEn || id}${configEvent.labelEn && configEvent.labelZh !== configEvent.labelEn ? ` (${configEvent.labelEn})` : ''}`,
                        title: configEvent.labelZh || configEvent.labelEn || id,
                        titleEn: configEvent.labelEn || configEvent.labelZh || id,
                        date: configEvent.date || '',
                        time: configEvent.time || '',
                    };
                }
                
                // 如果找不到，顯示 ID
                return {
                    id: id,
                    fullLabel: `活動 ID: ${id}`,
                    title: id,
                    titleEn: id,
                    date: '',
                    time: '',
                };
            });

            return (
                <div className="space-y-6 animate-fade-in">
                    {/* 個人資料 Personal Information */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-700 flex items-center">
                            <User size={16} className="mr-2 text-blue-600"/> Personal Information <span className="text-gray-500 font-normal ml-2">(個人資料)</span>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-50 pb-2">
                                <span className="text-gray-500">Name (英文姓名)</span>
                                <span className="font-bold text-gray-800 text-right">{formData.lastNameEn}, {formData.firstNameEn}</span>
                            </div>
                            {formData.nameZh && (
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Chinese Name (中文姓名)</span>
                                    <span className="font-medium text-right">{formData.nameZh}</span>
                                </div>
                            )}
                            {formData.dob && (
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Date of Birth (出生日期)</span>
                                    <span className="font-medium text-right">{formData.dob}</span>
                                </div>
                            )}
                            {formData.mobile && (
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Mobile Number (手機號碼)</span>
                                    <span className="font-medium text-right">{formData.mobile}</span>
                                </div>
                            )}
                            {formData.email && (
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Email Address (電郵地址)</span>
                                    <span className="font-medium text-right break-all">{formData.email}</span>
                                </div>
                            )}
                            {formData.passportNumber && (
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Passport No. (護照號碼)</span>
                                    <span className="font-medium text-right">{formData.passportNumber}</span>
                                </div>
                            )}
                            {formData.passportUrl && (
                                <div className="flex justify-between pt-2">
                                    <span className="text-gray-500">Passport Copy (護照副本)</span>
                                    <span className="text-green-600 text-xs font-bold flex items-center">
                                        <Check size={12} className="mr-1"/> Uploaded (已上傳)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 航班與住宿 Flight & Accommodation */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-700 flex items-center">
                            <Plane size={16} className="mr-2 text-red-600"/> Flight & Accommodation <span className="text-gray-500 font-normal ml-2">(航班與住宿)</span>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between border-b border-gray-50 pb-2">
                                <span className="text-gray-500">Flight (航班)</span>
                                <span className="font-medium text-right">{selectedFlight.labelEn} <span className="text-gray-400">({selectedFlight.labelZh})</span></span>
                            </div>
                            {selectedHotel && (
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Hotel (酒店)</span>
                                    <span className="font-medium text-right">{selectedHotel.labelEn} <span className="text-gray-400">({selectedHotel.labelZh})</span></span>
                                </div>
                            )}
                            <div className="flex justify-between border-b border-gray-50 pb-2">
                                <span className="text-gray-500">Room Type (房間類型)</span>
                                <span className="font-medium text-right">
                                    {formData.roomType === 'Single' ? 'Single Room (單人房)' : 'Twin Share (雙人房)'}
                                </span>
                            </div>
                            {formData.roomType === 'Twin' && (
                                <div className="flex justify-between border-b border-gray-50 pb-2">
                                    <span className="text-gray-500">Roommate (室友)</span>
                                    <span className="font-medium text-right">{formData.roommateName || 'Assigned by Org (由機構分配)'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 活動選擇 Event Selection */}
                    {formData.selectedEventIds.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-700 flex items-center">
                                <Calendar size={16} className="mr-2 text-purple-600"/> Event Selection <span className="text-gray-500 font-normal ml-2">(活動選擇)</span>
                            </div>
                            <div className="p-4 space-y-2 text-sm">
                                {selectedEvents.map((event, idx) => (
                                    <div key={idx} className="flex justify-between border-b border-gray-50 pb-2 last:border-0">
                                        <span className="text-gray-500">Event {idx + 1} (活動 {idx + 1})</span>
                                        <span className="font-medium text-right text-left ml-4">{event.fullLabel || event.title || event.id}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 特殊需求 Special Requirements */}
                    {(formData.dietaryRestrictions || formData.specialRemarks) && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-gray-700 flex items-center">
                                <AlertCircle size={16} className="mr-2 text-orange-600"/> Special Requirements <span className="text-gray-500 font-normal ml-2">(特殊需求)</span>
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                {formData.dietaryRestrictions && selectedDietary && (
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Dietary Requirements (飲食需求)</span>
                                        <span className="font-medium text-right">{selectedDietary.labelEn} <span className="text-gray-400">({selectedDietary.labelZh})</span></span>
                                    </div>
                                )}
                                {formData.specialRemarks && (
                                    <div className="pt-2">
                                        <span className="text-gray-500 block mb-2">Special Remarks (特殊備註)</span>
                                        <span className="font-medium text-gray-800 whitespace-pre-wrap block text-right">{formData.specialRemarks}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 登入信息 Login Information */}
                    <div className="bg-blue-50 rounded-xl border border-blue-200 overflow-hidden shadow-sm">
                        <div className="bg-blue-100 px-4 py-3 border-b border-blue-200 font-bold text-blue-800 flex items-center">
                            <User size={16} className="mr-2"/> Login Information <span className="text-blue-600 font-normal ml-2">(登入資訊)</span>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="text-gray-700 mb-2 text-sm font-bold">
                                    您的登入帳號 / Your Login Account:
                                </div>
                                <div className="font-bold text-blue-600 mb-3 text-base">
                                    {formData.email}
                                </div>
                                <div className="text-gray-700 mb-2 text-sm font-bold">
                                    初始密碼 / Initial Password:
                                </div>
                                <div className="font-bold text-blue-600 mb-3 text-base">
                                    {formData.passportNumber && formData.passportNumber.length >= 6
                                      ? formData.passportNumber.slice(-6)
                                      : formData.passportNumber && formData.passportNumber.length > 0
                                      ? formData.passportNumber.padStart(6, '0').slice(-6)
                                      : '123456'}
                                </div>
                                <div className="text-gray-600 text-xs block mt-2 leading-relaxed">
                                    💡 請使用護照號碼後6位作為首次登入密碼。登入後建議修改密碼。
                                    <br />
                                    💡 Please use the last 6 digits of your passport number as your initial password. We recommend changing your password after first login.
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-center text-gray-400 px-4">
                        By submitting, you confirm that all provided information is accurate. (提交即表示您確認所有提供的資料均準確無誤)
                    </p>
                </div>
            );
        default:
            return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
       {/* Loading Overlay */}
       {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
              <Loader2 className="text-red-500 animate-spin" size={48} />
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">Submitting Registration...</p>
                <p className="text-sm text-gray-500 mt-1">正在提交登記...</p>
                <p className="text-xs text-gray-400 mt-2">Please do not close this page (請勿關閉此頁面)</p>
              </div>
            </div>
          </div>
       )}

       {toastMessage && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center space-x-2 animate-fade-in ${toastMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {toastMessage.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
              <span className="text-sm font-medium">{toastMessage.msg}</span>
          </div>
       )}

       {/* Header */}
       <div className="bg-white px-4 pt-12 pb-4 flex items-center shadow-sm z-20">
           <button onClick={handlePrevious} className="p-2 hover:bg-gray-100 rounded-full mr-2">
               <ChevronLeft className="text-gray-600" />
           </button>
           <div>
               <h1 className="text-lg font-bold text-gray-800">Trip Registration <span className="text-gray-500 font-normal">(行程登記)</span></h1>
               <div className="text-xs text-gray-500">Step {currentStep} of {steps.length}: {steps[currentStep-1].title} ({steps[currentStep-1].titleZh})</div>
           </div>
       </div>

       {/* Progress Bar */}
       <div className="w-full bg-gray-100 h-1">
           <div 
                className="bg-red-500 h-1 transition-all duration-500 ease-out" 
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
           />
       </div>

       {/* Content Area */}
       <div className="flex-1 overflow-y-auto p-6 pb-32 bg-[#F9FAFB]">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                {renderStepContent()}
            </div>
       </div>

       {/* Bottom Navigation */}
       <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex justify-between items-center max-w-md mx-auto z-30">
           <button 
                onClick={handlePrevious}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
                Back (返回)
           </button>

           {currentStep < steps.length ? (
               <button 
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next Step (下一步)
                </button>
           ) : (
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Submitting... (提交中...)</span>
                        </>
                    ) : (
                        <span>Confirm & Submit (確認並提交)</span>
                    )}
                </button>
           )}
       </div>
    </div>
  );
};



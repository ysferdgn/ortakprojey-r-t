import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaTimes, FaEdit, FaPlus, FaCheck } from 'react-icons/fa';
import api from '../utils/api';
import Cropper from 'react-easy-crop';
import Modal from 'react-modal';

const breeds = {
    dog: [
        "Pomeranian", "Chihuahua", "Yorkshire Terrier", "Maltese", "Shih Tzu", "Pekingese", "Toy Poodle",
        "Cavalier King Charles", "Cocker Spaniel", "Beagle", "Bulldog", "French Bulldog", "Basenji",
        "Basset Hound", "Border Collie", "Shiba Inu", "Labrador Retriever", "Golden Retriever", "German Shepherd",
        "Siberian Husky", "Boxer", "Doberman", "Rottweiler", "Dalmatian", "Kangal", "Belgian Malinois",
        "Anatolian Shepherd", "Great Pyrenees", "Shetland Sheepdog", "Australian Shepherd", "Alaskan Malamute",
        "Akita Inu", "American Pit Bull Terrier", "Whippet", "Greyhound", "Papillon", "Boston Terrier",
        "Jack Russell Terrier", "Cane Corso", "Samoyed"
    ],
    cat: [
        "British Shorthair", "Scottish Fold", "Persian (İran Kedisi)", "Maine Coon", "Turkish Van (Van Kedisi)",
        "Turkish Angora (Ankara Kedisi)", "Siamese", "Ragdoll", "American Shorthair", "Bengal", "Sphynx (Tüysüz Kedi)",
        "Norwegian Forest Cat", "Russian Blue", "Burmese", "Chartreux", "Abyssinian", "Exotic Shorthair",
        "Oriental Shorthair", "Devon Rex", "Cornish Rex", "Manx", "Selkirk Rex", "Himalayan", "Balinese",
        "Savannah", "Toyger", "Munchkin", "LaPerm", "Tonkinese", "Turkish Semi-longhair", "Egyptian Mau",
        "Japanese Bobtail", "Somali", "Singapura", "American Curl", "Havana Brown", "Kurilian Bobtail",
        "Lykoi (Kurt Kedi)", "Ragamuffin", "Pixie-bob"
    ],
    bird: [
        "Muhabbet Kuşu", "Sultan Papağanı (Cockatiel)", "Cennet Papağanı (Lovebird)", "Jako Papağanı (African Grey)",
        "Amazon Papağanı", "Macaw Papağanı", "Kanarya", "Zebra İspinozu (Zebra Finch)", "Bengal İspinozu",
        "Hint Bülbülü", "Paraket (Budgerigar türü)", "Lori Papağanı", "Kakadu (Cockatoo)", "Senegal Papağanı",
        "Konur Papağanı (Conure)", "Mavi Papağan", "Yeşil Papağan", "Goldfinch (Saka Kuşu)", "İspinoz (Finch)",
        "Eclectus Papağanı", "Gülbaşlı Muhabbet Kuşu", "Büyük Alexander Papağanı", "Turuncu Suratlı Kanarya",
        "Maskeli Lovebird", "Java İspinozu", "Sarı Kanarya", "Mavi İspinoz", "Kakariki", "Kakadu Rose",
        "Keşiş Papağanı (Monk Parakeet)"
    ]
};

function getCroppedImg(imageSrc, croppedAreaPixels, zoom, aspect = 1) {
    return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.crossOrigin = 'anonymous';
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            const ctx = canvas.getContext('2d');
            
            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );
            
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas is empty'));
                }
            }, 'image/jpeg', 0.9);
        };
        image.onerror = reject;
    });
}

const AddPet = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [petData, setPetData] = useState({
        name: '',
        age: '',
        type: '',
        breed: '',
        gender: '',
        location: '',
        description: '',
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [cropModal, setCropModal] = useState({ open: false, index: null });
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [cropLoading, setCropLoading] = useState(false);
    const navigate = useNavigate();
    const [mainImageIdx, setMainImageIdx] = useState(0);
    const [hovered, setHovered] = useState(false);
    const [slideIdx, setSlideIdx] = useState(0);
    const fileInputRef = React.useRef();

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            api.get(`/pets/${id}`)
                .then(response => {
                    setPetData(response.data);
                    setLoading(false);
                })
                .catch(err => {
                    setError('İlan bilgileri yüklenemedi.');
                    setLoading(false);
                });
        }
    }, [id, isEditMode]);

    useEffect(() => {
        if (hovered && imagePreviews.length > 1) {
            const interval = setInterval(() => {
                setSlideIdx((prev) => (prev + 1) % imagePreviews.length);
            }, 2000);
            return () => clearInterval(interval);
        } else {
            setSlideIdx(mainImageIdx);
        }
    }, [hovered, imagePreviews.length, mainImageIdx]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPetData(prevData => {
            const newData = { ...prevData, [name]: value };
            if (name === 'type') {
                newData.breed = '';
            }
            return newData;
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImages(prev => [...prev, ...files]);
            
            // Her yeni dosya için preview oluştur
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
            
            // İlk eklenen resim için kırpma modal'ını aç
            if (files.length > 0) {
                setTimeout(() => openCropModal(images.length), 100);
            }
        }
    };

    const handleDrag = (from, to) => {
        if (from === to) return;
        
        const newImages = [...images];
        const newPreviews = [...imagePreviews];
        
        const [movedImage] = newImages.splice(from, 1);
        const [movedPreview] = newPreviews.splice(from, 1);
        
        newImages.splice(to, 0, movedImage);
        newPreviews.splice(to, 0, movedPreview);
        
        setImages(newImages);
        setImagePreviews(newPreviews);
        
        // Ana resim indexini güncelle
        if (mainImageIdx === from) {
            setMainImageIdx(to);
        } else if (from < mainImageIdx && to >= mainImageIdx) {
            setMainImageIdx(mainImageIdx - 1);
        } else if (from > mainImageIdx && to <= mainImageIdx) {
            setMainImageIdx(mainImageIdx + 1);
        }
    };

    const openCropModal = (index) => {
        setCropModal({ open: true, index });
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    const applyCrop = async () => {
        if (!croppedAreaPixels || cropModal.index === null) {
            console.error('Kırpma alanı veya index bulunamadı');
            return;
        }

        setCropLoading(true);
        
        try {
            const croppedBlob = await getCroppedImg(
                imagePreviews[cropModal.index], 
                croppedAreaPixels, 
                zoom
            );
            
            // Yeni File objesi oluştur
            const originalFile = images[cropModal.index];
            const croppedFile = new File([croppedBlob], originalFile.name, { 
                type: 'image/jpeg',
                lastModified: Date.now()
            });
            
            // Yeni preview URL oluştur
            const croppedPreviewUrl = URL.createObjectURL(croppedBlob);
            
            // Eski preview URL'sini temizle
            if (imagePreviews[cropModal.index]) {
                URL.revokeObjectURL(imagePreviews[cropModal.index]);
            }
            
            // State'leri güncelle
            const newImages = [...images];
            const newPreviews = [...imagePreviews];
            
            newImages[cropModal.index] = croppedFile;
            newPreviews[cropModal.index] = croppedPreviewUrl;
            
            setImages(newImages);
            setImagePreviews(newPreviews);
            
            // Modal'ı kapat
            setCropModal({ open: false, index: null });
            
        } catch (err) {
            console.error('Kırpma hatası:', err);
            setError('Resim kırpılırken bir hata oluştu.');
        } finally {
            setCropLoading(false);
        }
    };

    const closeCropModal = () => {
        setCropModal({ open: false, index: null });
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    const handleRemoveImage = (idx) => {
        // Preview URL'sini temizle
        if (imagePreviews[idx]) {
            URL.revokeObjectURL(imagePreviews[idx]);
        }
        
        setImages(prev => prev.filter((_, i) => i !== idx));
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
        
        // Ana resim indexini güncelle
        if (mainImageIdx >= idx && mainImageIdx > 0) {
            setMainImageIdx(prev => prev - 1);
        }
        
        // Kırpma modal'ı açıksa kapat
        if (cropModal.index === idx) {
            closeCropModal();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();

        // Form alanlarını ekle
        formData.append('name', petData.name);
        formData.append('age', petData.age);
        formData.append('type', petData.type);
        formData.append('breed', petData.breed);
        formData.append('gender', petData.gender);
        formData.append('location', petData.location);
        formData.append('description', petData.description);
        
        // Resimleri ekle
        if (images.length > 0) {
            images.forEach((image, index) => {
                formData.append('images', image);
            });
            // Ana resim indexini ekle
            formData.append('mainImageIndex', mainImageIdx.toString());
        } else if (isEditMode) {
            // Düzenleme modunda resim yoksa mevcut resimleri koru
            formData.append('images', JSON.stringify(petData.images));
        }

        try {
            const request = isEditMode
                ? api.put(`/pets/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                : api.post('/pets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            await request;
            
            // Preview URL'lerini temizle
            imagePreviews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            
            navigate('/my-listings');
        } catch (err) {
            setError(err.response?.data?.message || 'Bir hata oluştu.');
            setLoading(false);
        }
    };

    const handlePlusClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleSelectMain = (idx) => {
        setMainImageIdx(idx);
        setSlideIdx(idx);
    };

    // Component unmount olduğunda URL'leri temizle
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    if (loading && isEditMode) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">İlan yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <FaArrowLeft className="mr-2 h-4 w-4" />
                    Geri
                </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {isEditMode ? 'İlanı Düzenle' : 'Yeni İlan Ekle'}
            </h1>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
                    <p className="font-medium">Hata:</p>
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8">
                {/* Temel Bilgiler */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Temel Bilgiler</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                                İsim *
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                value={petData.name} 
                                onChange={handleChange} 
                                placeholder="Evcil hayvanın ismi" 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="age" className="block text-gray-700 text-sm font-semibold mb-2">
                                Yaş *
                            </label>
                            <input 
                                type="number" 
                                name="age" 
                                id="age" 
                                value={petData.age} 
                                onChange={handleChange} 
                                placeholder="Yaş" 
                                min="0"
                                max="30"
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-gray-700 text-sm font-semibold mb-2">
                                Tür *
                            </label>
                            <select 
                                name="type" 
                                id="type" 
                                value={petData.type} 
                                onChange={handleChange} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="" disabled>Tür Seçin</option>
                                <option value="cat">Kedi</option>
                                <option value="dog">Köpek</option>
                                <option value="bird">Kuş</option>
                                <option value="other">Diğer</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="breed" className="block text-gray-700 text-sm font-semibold mb-2">
                                Cins *
                            </label>
                            {petData.type && breeds[petData.type] ? (
                                <select 
                                    name="breed" 
                                    id="breed" 
                                    value={petData.breed} 
                                    onChange={handleChange} 
                                    required 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="" disabled>Cins Seçin</option>
                                    {breeds[petData.type].map((breed) => (
                                        <option key={breed} value={breed}>{breed}</option>
                                    ))}
                                </select>
                            ) : (
                                <input 
                                    type="text" 
                                    name="breed" 
                                    id="breed" 
                                    value={petData.breed} 
                                    onChange={handleChange} 
                                    placeholder="Cins" 
                                    required 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            )}
                        </div>

                        <div>
                            <label htmlFor="gender" className="block text-gray-700 text-sm font-semibold mb-2">
                                Cinsiyet *
                            </label>
                            <select 
                                name="gender" 
                                id="gender" 
                                value={petData.gender} 
                                onChange={handleChange} 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="" disabled>Cinsiyet Seçin</option>
                                <option value="female">Dişi</option>
                                <option value="male">Erkek</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-gray-700 text-sm font-semibold mb-2">
                                Konum / Şehir *
                            </label>
                            <input 
                                type="text" 
                                name="location" 
                                id="location" 
                                value={petData.location} 
                                onChange={handleChange} 
                                placeholder="Şehir" 
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Açıklama */}
                <div className="mb-8">
                    <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">
                        Açıklama *
                    </label>
                    <textarea 
                        name="description" 
                        id="description" 
                        value={petData.description} 
                        onChange={handleChange} 
                        placeholder="Evcil hayvanınız hakkında detaylı bilgi verin..." 
                        required 
                        rows="5" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                    />
                </div>

                {/* Resimler */}
                <div className="mb-8">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                        Resimler *
                    </label>
                    <p className="text-gray-600 text-sm mb-4">
                        En az 1 resim eklemelisiniz. İlk resim ana resim olarak kullanılacaktır.
                    </p>
                    
                    <input 
                        ref={fileInputRef} 
                        type="file" 
                        name="images" 
                        id="images" 
                        onChange={handleImageChange} 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                    />
                    
                    <div className="flex gap-4 flex-wrap items-start">
                        <button 
                            type="button" 
                            onClick={handlePlusClick} 
                            className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-blue-50 hover:border-blue-300 text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <FaPlus className="text-2xl mb-2" />
                            <span className="text-sm font-medium">Resim Ekle</span>
                        </button>
                        
                        {imagePreviews.map((src, idx) => (
                            <div
                                key={idx}
                                draggable
                                onDragStart={e => e.dataTransfer.setData('text/plain', idx.toString())}
                                onDrop={e => { 
                                    e.preventDefault(); 
                                    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                                    handleDrag(fromIdx, idx); 
                                }}
                                onDragOver={e => e.preventDefault()}
                                className={`relative group border-2 rounded-lg shadow-sm bg-white cursor-move transition-all hover:shadow-md ${
                                    mainImageIdx === idx ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'
                                }`}
                                onMouseEnter={() => setHovered(true)}
                                onMouseLeave={() => setHovered(false)}
                            >
                                <div className="p-2">
                                    <img 
                                        src={imagePreviews[hovered && imagePreviews.length > 1 && mainImageIdx === idx ? slideIdx : idx]} 
                                        alt={`Preview ${idx + 1}`} 
                                        className="w-28 h-28 object-cover rounded-md" 
                                    />
                                    
                                    <div className="flex gap-1 mt-2">
                                        <button 
                                            type="button" 
                                            onClick={() => openCropModal(idx)} 
                                            className="flex-1 flex items-center justify-center gap-1 text-blue-600 hover:text-blue-800 text-xs py-1 px-2 rounded transition-colors"
                                            title="Resmi kırp"
                                        >
                                            <FaEdit size={12} />
                                            Kırp
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveImage(idx)} 
                                            className="flex items-center justify-center bg-red-500 text-white rounded p-1 hover:bg-red-600 transition-colors"
                                            title="Resmi sil"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Resim numarası */}
                                <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                                    {idx + 1}
                                </span>
                                
                                {/* Ana resim işareti */}
                                {mainImageIdx === idx && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                        <FaCheck size={12} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Ana resim seçici */}
                    {imagePreviews.length > 1 && (
                        <div className="mt-6">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Ana Resim Seçin:</p>
                            <div className="flex gap-2 flex-wrap">
                                {imagePreviews.map((src, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectMain(idx)}
                                        className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                            mainImageIdx === idx 
                                                ? 'border-green-500 ring-2 ring-green-200' 
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        title={`${idx + 1}. resmi ana resim yap`}
                                    >
                                        <img src={src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                        {mainImageIdx === idx && (
                                            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                                                <FaCheck className="text-green-600 bg-white rounded-full p-1" size={20} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Butonları */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
                    <div className="flex gap-4">
                        <button 
                            type="submit" 
                            disabled={loading || imagePreviews.length === 0} 
                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {isEditMode ? 'Güncelleniyor...' : 'Ekleniyor...'}
                                </div>
                            ) : (
                                isEditMode ? 'İlanı Güncelle' : 'İlanı Oluştur'
                            )}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)} 
                            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        >
                            İptal
                        </button>
                    </div>
                    
                    {imagePreviews.length === 0 && (
                        <p className="text-sm text-red-600">
                            En az 1 resim eklemelisiniz
                        </p>
                    )}
                </div>
            </form>

            {/* Kırpma Modal'ı */}
            <Modal 
                isOpen={cropModal.open} 
                onRequestClose={closeCropModal}
                ariaHideApp={false}
                className="fixed inset-0 flex items-center justify-center p-4 z-50"
                overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
            >
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Resmi Kırp
                            </h3>
                            <button
                                onClick={closeCropModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Resmi istediğiniz şekilde kırpın
                        </p>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6">
                        {typeof cropModal.index === 'number' && imagePreviews[cropModal.index] && (
                            <div className="space-y-6">
                                {/* Cropper Container */}
                                <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                                    <Cropper
                                        image={imagePreviews[cropModal.index]}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        onCropChange={setCrop}
                                        onZoomChange={setZoom}
                                        onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                                        style={{
                                            containerStyle: {
                                                width: '100%',
                                                height: '100%',
                                                position: 'relative'
                                            }
                                        }}
                                    />
                                </div>

                                {/* Zoom Control */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Yakınlaştırma: {Math.round(zoom * 100)}%
                                    </label>
                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={applyCrop}
                                        disabled={cropLoading || !croppedAreaPixels}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {cropLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                İşleniyor...
                                            </>
                                        ) : (
                                            <>
                                                <FaCheck size={16} />
                                                Onayla
                                            </>
                                        )}
                                    </button>
                                    
                                    <button 
                                        onClick={closeCropModal}
                                        disabled={cropLoading}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                                    >
                                        <FaTimes size={16} />
                                        İptal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AddPet;
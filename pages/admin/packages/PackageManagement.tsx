import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Package, Plus, Edit, Trash2, Check, X, DollarSign, Clock, Users } from 'lucide-react';

interface PackageFeature {
  text: string;
  included: boolean;
}

interface PackageData {
  id: string;
  name: string;
  price: number;
  duration: string; // "month", "year", etc.
  features: PackageFeature[];
  classesPerWeek: number;
  sessionDuration: number; // in minutes
  isActive: boolean;
  displayOrder: number;
  createdAt?: any;
  updatedAt?: any;
}

export default function PackageManagement() {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const emptyPackage: Omit<PackageData, 'id'> = {
    name: '',
    price: 0,
    duration: 'month',
    features: [],
    classesPerWeek: 2,
    sessionDuration: 30,
    isActive: true,
    displayOrder: 0
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'packages'));
      const packagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PackageData));
      
      // Sort by display order
      packagesData.sort((a, b) => a.displayOrder - b.displayOrder);
      setPackages(packagesData);
    } catch (error) {
      console.error('Error fetching packages:', error);
      alert('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPackage({ id: '', ...emptyPackage } as PackageData);
  };

  const handleEdit = (pkg: PackageData) => {
    setIsCreating(false);
    setEditingPackage(pkg);
  };

  const handleCancel = () => {
    setEditingPackage(null);
    setIsCreating(false);
    setNewFeature('');
  };

  const handleSave = async () => {
    if (!editingPackage) return;

    if (!editingPackage.name || editingPackage.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (isCreating) {
        // Create new package
        await addDoc(collection(db, 'packages'), {
          ...editingPackage,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        alert('Package created successfully!');
      } else {
        // Update existing package
        const packageRef = doc(db, 'packages', editingPackage.id);
        await updateDoc(packageRef, {
          ...editingPackage,
          updatedAt: Timestamp.now()
        });
        alert('Package updated successfully!');
      }

      handleCancel();
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package');
    }
  };

  const handleDelete = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await deleteDoc(doc(db, 'packages', packageId));
      alert('Package deleted successfully!');
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const addFeature = () => {
    if (!newFeature.trim() || !editingPackage) return;

    setEditingPackage({
      ...editingPackage,
      features: [...editingPackage.features, { text: newFeature, included: true }]
    });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    if (!editingPackage) return;
    
    const updatedFeatures = editingPackage.features.filter((_, i) => i !== index);
    setEditingPackage({
      ...editingPackage,
      features: updatedFeatures
    });
  };

  const toggleFeatureIncluded = (index: number) => {
    if (!editingPackage) return;
    
    const updatedFeatures = editingPackage.features.map((feature, i) => 
      i === index ? { ...feature, included: !feature.included } : feature
    );
    setEditingPackage({
      ...editingPackage,
      features: updatedFeatures
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-primary-600" />
              Package Management
            </h1>
            <p className="text-white mt-2">Create, edit, and manage pricing packages</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Package
          </button>
        </div>

        {/* Package List */}
        {!editingPackage && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-slate-800 rounded-xl shadow-lg p-6 border-2 ${
                  pkg.isActive ? 'border-white/10' : 'border-red-200 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-primary-600">${pkg.price}</span>
                    <span className="text-white mb-2">/ {pkg.duration}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span>{pkg.classesPerWeek} Classes Per Week</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span>{pkg.sessionDuration}-Minute Sessions</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-white' : 'text-white line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {pkg.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-white text-sm">Order: {pkg.displayOrder}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Form */}
        {editingPackage && (
          <div className="bg-slate-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {isCreating ? 'Create New Package' : 'Edit Package'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Package Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  className="w-full px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  placeholder="e.g., Basic Package"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  value={editingPackage.price}
                  onChange={(e) => setEditingPackage({ ...editingPackage, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  placeholder="15"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Duration
                </label>
                <select
                  value={editingPackage.duration}
                  onChange={(e) => setEditingPackage({ ...editingPackage, duration: e.target.value })}
                  className="w-full px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                >
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>

              {/* Classes Per Week */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Classes Per Week
                </label>
                <input
                  type="number"
                  value={editingPackage.classesPerWeek}
                  onChange={(e) => setEditingPackage({ ...editingPackage, classesPerWeek: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  min="1"
                />
              </div>

              {/* Session Duration */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  value={editingPackage.sessionDuration}
                  onChange={(e) => setEditingPackage({ ...editingPackage, sessionDuration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  min="15"
                  step="15"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editingPackage.displayOrder}
                  onChange={(e) => setEditingPackage({ ...editingPackage, displayOrder: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  min="0"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editingPackage.isActive}
                  onChange={(e) => setEditingPackage({ ...editingPackage, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-white/10 rounded focus:ring-sky-500"
                />
                <label className="text-sm font-medium text-white">
                  Active (visible to users)
                </label>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-8">
              <label className="block text-sm font-medium text-white mb-3">
                Package Features
              </label>
              
              {/* Add Feature Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  className="flex-1 px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  placeholder="Add a feature (e.g., Qualified Teacher)"
                />
                <button
                  onClick={addFeature}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Feature List */}
              <div className="space-y-2">
                {editingPackage.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg text-white">
                    <button
                      onClick={() => toggleFeatureIncluded(index)}
                      className={`p-1 rounded ${
                        feature.included ? 'text-green-600 hover:bg-green-100' : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {feature.included ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                    <span className={`flex-1 ${feature.included ? 'text-white' : 'text-white line-through'}`}>
                      {feature.text}
                    </span>
                    <button
                      onClick={() => removeFeature(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleCancel}
                className="px-6 py-3 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition-colors text-white text-white text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                {isCreating ? 'Create Package' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!editingPackage && packages.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No packages yet</h3>
            <p className="text-white mb-6">Create your first pricing package to get started</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Package
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

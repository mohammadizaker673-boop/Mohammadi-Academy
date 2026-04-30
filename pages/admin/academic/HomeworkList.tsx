import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Homework } from '../../../types/academic.types';
import { ClipboardList, Plus, Calendar, Users } from 'lucide-react';

export default function HomeworkList() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'homework'));
      const homeworkData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Homework[];
      setHomework(homeworkData);
    } catch (error) {
      console.error('Error fetching homework:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ClipboardList className="text-primary-500" size={32} />
            Homework Management
          </h1>
          <p className="text-white mt-2">View and manage all homework assignments</p>
        </div>
        <Link
          to="/admin/homework/create"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-accent-600 transition"
        >
          <Plus size={20} />
          Create Homework
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-white">Loading homework...</p>
        </div>
      ) : homework.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl shadow">
          <ClipboardList className="mx-auto text-white" size={48} />
          <p className="mt-4 text-white">No homework found</p>
          <Link
            to="/admin/homework/create"
            className="mt-4 inline-block text-primary-500 hover:text-primary-600 font-semibold"
          >
            Create your first homework
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {homework.map((hw) => (
            <div key={hw.id} className="bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{hw.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        hw.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-white'
                      }`}
                    >
                      {hw.status}
                    </span>
                  </div>
                  <p className="text-white mb-4">{hw.description}</p>
                  <div className="flex items-center gap-6 text-sm text-white">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      Due: {hw.dueDate?.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users size={16} />
                      {hw.assignedTo.length} students
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

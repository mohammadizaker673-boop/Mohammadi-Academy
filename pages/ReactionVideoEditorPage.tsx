import React from 'react';
import ReactionVideoEditor from '../components/reaction/ReactionVideoEditor';

/**
 * Reaction Video editor page.
 * - Inside the admin / teacher layouts it fills the content area.
 * - `fullPage` renders it standalone at /reaction-video.
 */
const ReactionVideoEditorPage: React.FC<{ fullPage?: boolean }> = ({ fullPage }) => <ReactionVideoEditor fullPage={fullPage} />;

export default ReactionVideoEditorPage;

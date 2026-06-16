# Hospital Report Upload - Testing Guide

## ✅ File Upload Functionality

The hospital report upload feature now supports:
- Click to upload
- Drag and drop
- File validation (type and size)
- Visual feedback
- Remove file option

## 🧪 How to Test

### Method 1: Click to Upload
1. Go to http://localhost:3000
2. Scroll to the "Hospital Report / Medical Prescription" field
3. **Click anywhere on the upload area** (the dashed box)
4. File picker should open
5. Select a PDF, JPG, or PNG file
6. File should display with green checkmark
7. File name and size should show
8. "Remove File" button should appear

### Method 2: Drag and Drop
1. Go to http://localhost:3000
2. Find a PDF, JPG, or PNG file on your computer
3. **Drag the file** over the upload area
4. Upload area should turn red/pink
5. **Drop the file**
6. File should display with green checkmark
7. File name and size should show
8. "Remove File" button should appear

### Method 3: Remove File
1. Upload a file using either method above
2. Click the **"Remove File"** button
3. Upload area should reset to original state
4. Can upload a different file

## ✅ File Validation

### Accepted File Types
- ✅ PDF (.pdf)
- ✅ JPG/JPEG (.jpg, .jpeg)
- ✅ PNG (.png)

### File Size Limit
- ✅ Maximum: 5MB
- ❌ Files larger than 5MB will be rejected with an alert

### Error Messages
- **File too large**: "File size exceeds 5MB. Please choose a smaller file."
- **Wrong file type**: "Invalid file type. Please upload PDF, JPG, or PNG files only."

## 🎨 Visual Feedback

### Default State
- Gray dashed border
- Light gray background
- Upload cloud icon
- "Click to upload or drag and drop" text

### Hover State
- Red dashed border
- Light red background
- Icon scales up slightly
- Slight lift effect

### Drag Over State
- Red dashed border
- Light red background
- Slight scale effect

### Success State (File Uploaded)
- Green solid border
- Light green background
- File type icon (PDF/Image)
- File name and size displayed
- Green checkmark
- "Remove File" button

## 🐛 Troubleshooting

### Upload Area Not Clickable
**Issue**: Clicking doesn't open file picker
**Solution**: 
- Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page (Ctrl+R or Cmd+R)

### Drag and Drop Not Working
**Issue**: Dropping file doesn't work
**Solution**:
- Make sure you're dropping directly on the upload area
- Try clicking to upload instead
- Check browser console for errors

### File Not Displaying After Upload
**Issue**: File uploads but doesn't show
**Solution**:
- Check file size (must be under 5MB)
- Check file type (PDF, JPG, PNG only)
- Check browser console for errors

### Remove Button Not Working
**Issue**: Can't remove uploaded file
**Solution**:
- Refresh the page
- Upload a new file (will replace the old one)

## 💡 Tips

1. **File Size**: Keep files under 5MB for best performance
2. **File Type**: PDF is recommended for hospital reports
3. **File Name**: Use descriptive names for your files
4. **Multiple Files**: Only one file can be uploaded at a time
5. **Replace File**: Upload a new file to replace the current one, or click "Remove File" first

## ✅ Success Indicators

When file upload is working correctly, you should see:
- ✅ Upload area is clickable
- ✅ File picker opens on click
- ✅ Drag and drop works
- ✅ File name displays after upload
- ✅ File size shows in KB
- ✅ Green checkmark appears
- ✅ Remove button works
- ✅ Can upload different file after removing

## 🎯 Form Submission

After uploading a file:
1. Fill in all other required fields
2. Check the confirmation checkbox
3. Click "Search for Donors Now"
4. Form should submit successfully
5. If file is missing, you'll see: "Please upload a hospital report or medical prescription."

## 📱 Mobile Testing

On mobile devices:
- Tap the upload area to open file picker
- Select file from camera or gallery
- File should upload and display
- Remove button should work

---

## ✅ All Features Working

If you can:
- ✅ Click to upload
- ✅ Drag and drop files
- ✅ See file name and size
- ✅ Remove uploaded files
- ✅ Get validation errors for wrong files
- ✅ Submit form with uploaded file

Then your file upload is **fully functional**! 🎉

# Image Processing on Google Cloud

This solution includes frontend and backend code to demonstrate image processing use cases on Google Cloud.

Image processing is one of the most tangible ways to incorporate AI to improve customer operations. Examples include defect detection in manufacturing, unsafe image detection for user-generated content, and disease diagnosis in healthcare, among others. However, doing this in a scalable way requires the integration of several GCP products.

The presented solution uses the following technologies:

- [Cloud Functions](https://cloud.google.com/functions/docs)
- [Vision AI](https://cloud.google.com/vision)

### Files

Some important files and folders.

| File/Folder        | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| /src/frontend      | React web app: A frontend to upload images/urls to the backend for image processing. |
| /src/gcf           | Backend Cloud Functions code that calls the Vision API for image processing.         |
| /infra             | Terraform infrastructure for deploying the solution.                                 |
| /.github/workflows | Github workflows for CI and testing                                                  |

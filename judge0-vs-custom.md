# Judge0 vs Custom Runner

## When to use Judge0?
- **Rapid Development**: You need a judge system *now* and don't want to deal with security, isolation, and maintenance of the runner.
- **Language Support**: You need support for 60+ languages out of the box.
- **Security**: Judge0 (especially the Cloud version) has handled security risks (fork bombs, network access) that are hard to get right manually.
- **Scale**: Offload the heavy lifting to a dedicated service.

## When to write a Custom Runner?
- **Specific Requirements**: You need custom metrics, specialized hardware access (GPU), or non-standard languages/environments.
- **Cost**: You want to host it yourself on your own hardware without paying for Judge0 Cloud or managing Judge0 Self-Hosted complexity (though Judge0 self-hosted is free, it's complex).
- **Learning**: You want to understand how online judges work (seccomp, cgroups, namespaces).
- **Deep Integration**: You need the runner to be tightly coupled with your backend logic (e.g., interactive problems, custom scoring).

## Example Request to Judge0 API
```bash
POST https://judge0-ce.p.rapidapi.com/submissions

{
    "source_code": "print(\"hello world\")",
    "language_id": 71, // Python (3.8.1)
    "stdin": "",
    "expected_output": "hello world"
}
```

## Example Backend Integration (NestJS)
If using Judge0, you would replace the `SubmissionProcessor` logic with an HTTP call:

```typescript
// definition
import { HttpService } from '@nestjs/axios';

// inside service
const response = await this.httpService.axiosRef.post('https://judge0-ce.p.rapidapi.com/submissions', {
    source_code: submission.code,
    language_id: 71,
    stdin: input
}, {
    params: { base64_encoded: 'false', wait: 'true' }
});

const verdict = response.data.status.description; // "Accepted"
```

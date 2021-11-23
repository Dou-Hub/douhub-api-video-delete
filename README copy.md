yarn add serverless-plugin-external-sns-events

1. Go to "Simple Noification Service" 

2. Create a new SNS topic. "douhub-us-prod-s3-video-delete"

3. Go to "Other topic actions", "Edit topic policy", and "Advanced View". Replace the contents of the default policy with the following:
```
{
  "Version": "2008-10-17",
  "Id": "__default_policy_ID",
  "Statement": [
    {
      "Sid": "__default_statement_ID",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": [
        "SNS:GetTopicAttributes",
        "SNS:SetTopicAttributes",
        "SNS:AddPermission",
        "SNS:RemovePermission",
        "SNS:DeleteTopic",
        "SNS:Subscribe",
        "SNS:ListSubscriptionsByTopic",
        "SNS:Publish",
        "SNS:Receive"
      ],
      "Resource": "arn:aws:sns:us-east-1:110064165845:douhub-us-prod-s3-video-delete",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn":  "arn:aws:s3:*:*:douhub-us-prod-video",
        }
      }
    }
  ]
}
```
4. Go to "douhub-video" S3 bucket, "Properties" -> "Events" -> Add the new event "sns-douhub-s3-video-delete" Send to the SNS topic created about by listening to the event "ObjectDelete (All)"

5. deploy-prod-douhub
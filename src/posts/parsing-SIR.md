---
title: "Handling large data: Special Intensive Revision of voters in Tamil Nadu, India"
date: "2025-29-12"
slug: "parsing-SIR"
description: "On downloading, parsing and analyzing large dataset of 9.7 million voters in one Indian state"
---

Data journalism often begins where documentation ends. Even when public information exists in abundance, it’s rarely in a form that can be examined, questioned, or cross-checked at scale.

Last week, I worked on a project that examined discrepancies in voter deletions across polling booths in Tamil Nadu during the Special Intensive Revision (SIR). The final reporting is concise. The process behind it was anything but. And, spoiler alert: There’s more SIR data to analyze!

This project did not begin with a spreadsheet, or with clean, ready-to-analyze data. It began with a simple question: How do I audit records of over 97 lakh deleted voters and look for patterns or inconsistencies hidden in plain sight?

The Chief Electoral Officer Tamil Nadu’s website hosted thousands of PDFs listing deleted voters’ names, age, EPIC numbers, genders, polling booths, and assembly constituencies. This wasn’t a handful of files. There were over 75,000 PDFs; one for every polling booth in the state. Some files had a single voter. Others had more than 800, spanning up to 90+ pages.

There was no master index of files. No documentation on how to download them. The website itself was unstable and crashed repeatedly during my initial scraping attempts.

Still, there was some semblance of a structure. To be precise, it was hidden in how the website generated PDF links. Finding it felt like solving a puzzle. For large-scale scraping, cracking a URL pattern is often the most reliable way forward.

Once I identified that pattern, I wrote a script to systematically request each PDF, handle interruptions, and log failures. This solved downloading at scale, but not knowing when to stop.

After testing it on smaller batches, I ran it across multiple machines. This alone took tens of hours of compute time.

Before I processed voter records, I had to answer a basic but critical question: had I actually downloaded every PDF, for every polling booth for which data exists?

Unlike well-documented APIs, this website provided no authoritative list of polling booths per constituency. I didn’t know upfront whether a constituency had 180, 260, or 320 booths.

Because the code downloaded files in consecutive order, this uncertainty mattered. The moment the script stopped making requests to the website, it would assume it had reached the end. If that assumption was wrong, entire polling booths and their voters’ records would be silently missed. Alarmingly, without logging any error at that.

To resolve this, I let the website itself signal when to stop.

Instead of assuming a fixed number of polling booths, the script attempted to download PDFs sequentially, one polling booth at a time, for each assembly constituency. Every request was logged along with its HTTP status code (think of it as a website’s way of telling you if the data you’re trying to access exists or not).

Sometimes, websites return intermittent 404s due to caching issues, partial uploads, or temporary server failures. Treating a single failure as a stopping signal risked missing valid data.

A successful response (HTTP 200) confirmed that the polling booth existed and downloading continued. A “file not found” response (HTTP 404 / Error 404: File not found) suggested that the requested polling booth might not exist. But, a single 404 was not enough to draw that conclusion.

The rule I set to tackle this was to only stop attempting downloads after three consecutive 404 errors. Three consecutive failures strongly indicated the script had passed the highest-numbered polling booth for a constituency. I also manually tested out this logic for a bunch of different constituencies.

Doing it this way allowed the script to probe beyond the real endpoint and avoided unnecessarily overburdening the website.

Effectively, coding the stopping logic in this way helped me discover the right range of polling booths from the data uploaded by CEO Tamil Nadu’s website itself.

**How the 404-based stopping logic worked**

In practice, the script behaved like this:

- Start with polling booth 1 for a constituency
- Download PDFs sequentially (PS 1, PS 2, PS 3, …)
- Reset the error counter every time a valid PDF was found
- Increment the counter only when a 404 occurred
- Exit only after three 404s in a row

Even after downloading everything, I didn’t assume success. In a few cases, instead of PDFs, corrupt “pdf.part” extension files got downloaded. To check this, I wrote code to go through all 234 assembly constituencies’ folders and check if:
a.	They in fact contained the right number of files – inferred and logged from our downloading logic.
b.	And, if they were in consecutive order. For instance, a folder containing files numbered up to polling station 306 might still contain only 305 files. A missing file somewhere in the middle would go unnoticed without explicit checks. So, another script was written to loop through each constituency folder and verify all polling booth numbers were continuous. This flagged any missing files in between.

In total, eight corrupted PDFs were found and manually fixed, a tiny number relative to the dataset size, but unacceptable to ignore nonetheless.

Before parsing PDFs into records, I added yet another verification layer.

From each PDF, I extracted the last serial number on the final page, meaning the number of deleted voters listed in that file. These counts were logged separately and summed. This was matched against ECI’s press releases. 

The next challenge was to read data out of PDFs— a tall, complicated order in its own might. Downloading thousands of files was only scratching the surface. The crème de la crème lay beneath.  

By the end of this phase, over 200 GB of data had been downloaded. That’s roughly equivalent to 50,000 high-resolution photos or more than 200 full-length HD movies. Importantly, this wasn’t a single large file, but tens of thousands of small PDFs that were enormous in aggregate.

Throughout the process, various verification steps were performed, manually and using code. It is, after all, the backbone of the entire pipeline.

Only after every check passed — automated and manual — did I begin parsing, analysing, and finally reporting on the data. For any data story to read smoothly, its credibility rests on thousands of tiny checks to make sure nothing slipped through unnoticed.

Another critical checkpoint involved extracting the number of voters from the last page of every PDF and storing that total separately. This was cross-verified against publicly available data and later after PDFs were converted into a machine-readable format, against that as well. To read from the PDFs, I wrote a parser that opened each file page by page, extracting individual voters’ names, ages, genders, and reason for deletion. 

A further complication was language. The data was in Tamil. And, while translation tools exist, reliable, free, large-scale Tamil-to-English translation libraries are limited. I used Argos Translate, an open-source tool that integrates well with Python, to handle this step.

The output was a massive collection of machine-readable records. These were then consolidated into a single SQLite database, about 1.2 GB in size, containing over 97 lakh voter deletions. 

Finally, every voter deletion, reason, age, and gender across every polling station could be queried systematically rather than anecdotally. After several hours spent using several computers to reach this stage, I was finally able to begin querying the data. 

The questions I asked? Just as a journalist would interview a human source. The most basic of all questions when using code to query data is to start with looking for outliers then poking those until trends emerge. 

These patterns would have been impossible to see by manually reading PDFs, no matter how diligently.

<i>A version of this was also published for The Hindu’s data newsletter. This version builds on top of that, adding more necessary technical details.</i>
# Project pipeline diagrams

Seven static images replace the rejected illustrative simulation in Project Forge. Each is an actual 2880px-wide PNG exported from an editable Figma Design frame, not an AI-generated architecture illustration. The image opens in an accessible native dialog with fit/zoom controls. Images are served locally; no Figma requests or cloud API calls happen at runtime.

Figma file: https://www.figma.com/design/3zLiGlrMVFqsEELo6zw05g

| Project | Figma node | Source inspected |
| --- | --- | --- |
| VenomLink | 53:3302 | [Architecture](https://github.com/shehar-e-yaar/venomlink/blob/main/ARCHITECTURE.md), [current README](https://github.com/shehar-e-yaar/venomlink/blob/main/README.md), [model integration](https://github.com/shehar-e-yaar/venomlink/blob/main/design/model-integration.md) |
| Stock pipeline | 53:3418 | [Producer](https://github.com/shehar-e-yaar/Data_Engineering_Projects/blob/main/Real_Time_Stock_Pipeline/producer/stock_api_producer.py), [stream processor](https://github.com/shehar-e-yaar/Data_Engineering_Projects/blob/main/Real_Time_Stock_Pipeline/spark/stream_processor.py), [dashboard](https://github.com/shehar-e-yaar/Data_Engineering_Projects/blob/main/Real_Time_Stock_Pipeline/dashboard/app.py) |
| NYC Taxi | 53:3475 | [DAG](https://github.com/shehar-e-yaar/Data_Engineering_Projects/blob/main/NYC_Taxi_ETL/dags/ETL.py), [README](https://github.com/shehar-e-yaar/Data_Engineering_Projects/blob/main/NYC_Taxi_ETL/Readme.md.txt) |
| E-commerce | 53:3529 | [Documented model](https://github.com/shehar-e-yaar/Data_Engineering_Projects/blob/main/e_commerce_dbt/Readme.md) |
| OmbudsAI | 53:3592 | [Guardrail architecture](https://github.com/shehar-e-yaar/Ombuds-AI/blob/main/README.md) |
| Research | 53:3673 | [Actual file-based streaming audit](https://github.com/shehar-e-yaar/RESEARCH_WORK/blob/main/DDos%20Attack%20Detecting/spark_structured_streaming_real.py) |
| Text editor | 53:3736 | [Editor implementation](https://github.com/shehar-e-yaar/Intelligent-Text-Editor/blob/main/main.cpp) |

Inspected 2026-11-04. Arrows communicate the named data flow or request; they do not imply a live execution. Dashed arrows mark scheduling or backup paths. Docker boundaries denote infrastructure, not data-processing stages. Generic file, buffer, policy and human symbols are semantic icons, not vendor logos.

VenomLink intentionally separates cloud requests from local ONNX classification, excludes undeployed Glue/Iceberg/Athena extensions, and makes no medical validation claim. The current README and model integration document confirm on-device classification despite an older conflicting sentence in ARCHITECTURE.md. Research illustrates the audited Spark file path, not a Kafka deployment or the repository's separate ML experiments. OmbudsAI depicts fictional tickets and both primary and backup memo paths.

## Artwork sources

- AWS service symbols: [official AWS Architecture Icons](https://aws.amazon.com/architecture/icons/), Icon-package_07312026. Retained original service colors/backgrounds, proportions and white line art. AWS permits these assets in architecture diagrams.
- Python, Airflow, PostgreSQL, React, Streamlit: [Devicon](https://github.com/devicons/devicon), SVG originals.
- Kafka, Snowflake, ONNX, Google Maps, Gemini: [Simple Icons](https://github.com/simple-icons/simple-icons), SVG marks. Power BI uses the Simple Icons 11.0.0 mark. Brand marks remain owned by their respective owners.
- dbt, Spark, Docker, C++, SQL: existing portfolio Figma technology components.
- Diagram colors and typography reuse the portfolio's Figma variables and Space Grotesk.

## Behavior and preservation

- Successful assembly displays the corresponding image. A successful load on the active page dispatches `pipeline-viewed` with the current assembly revision.
- Stale loads cannot unlock a project after removal/reassignment. A failed image offers Retry and does not unlock the project.
- Existing saved reveals remain compatible. Legacy complete assignments reveal when their image loads.
- The inventory, book navigation, terminal, source links and final receipt remain intact. There is no simulation timer, replay simulation button, or Build choice paragraph.
- The dialog is portaled outside the transformed book so it cannot be clipped. Escape closes it; focus returns to its opener. Zoom permits scrolling on small screens.
- No new dependencies, backend changes, GitHub push or deployment.

## Completion checklist

- [x] Seven repository-specific diagrams created as editable Figma layers.
- [x] Official colored AWS icons and vector technology artwork used before export.
- [x] Short labels and noncrossing connectors visually checked across all seven images.
- [x] Rejected simulation replaced with static local images.
- [x] Desktop/mobile full-size viewing, keyboard close and zoom included.
- [x] Existing unlock, persistence, inventory and receipt tests updated.
- [x] Automated checks validate every image's PNG signature and exact HD dimensions.

Verification completed 2026-11-05: production build passed; 61 tests across 8 files passed; all seven exported diagrams visually inspected. Desktop browser check confirmed the embedded VenomLink image, full-size viewer, zoom control, Escape close and focus restoration. Mobile-specific browser interaction was not rerun. No lint script is configured. Earlier Project Forge documents describe historical simulation behavior; this document supersedes that part.

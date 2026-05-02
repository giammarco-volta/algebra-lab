import { Fragment, useState } from "react";
import "./App.css";
import { evaluateExpression } from "./algebra/evaluateExpression";
import { formatResult } from "./algebra/format";
import {
  formatNoteInTET,
  midiNote,
  intervalCents,
  stepClassInTET,
  noteFrequencyHz,
} from "./algebra/projections";

import { parseIntervalName, intervalName } from "./algebra/intervals";
import { centeredMod, PERIOD } from "./algebra/constants";

function App() {
  const [input, setInput] = useState("D4# - G2bb");
  const [output, setOutput] = useState("");
  const [lastResult, setLastResult] = useState<any>(null);

  const [theoryInput, setTheoryInput] = useState("IVaug2");
  const [theoryOutput, setTheoryOutput] = useState("");

  const [internalInput, setInternalInput] = useState("0");
  const [internalOutput, setInternalOutput] = useState("");

  function runExpression() {
    const result = evaluateExpression(input);

    if (!result.ok) {
      setOutput(result.message);
      setLastResult(null);
      return;
    }

    setOutput(formatResult(result.kind, result.value));
    setLastResult(result);
  }

  function runTheoryToInternal() {
    const value = parseIntervalName(theoryInput);

    if (value === null) {
      setTheoryOutput("Unable to parse expression.");
      return;
    }

    setTheoryOutput(`n = ${centeredMod(value, PERIOD)}`);
    setInternalInput(String(centeredMod(value, PERIOD)));
  }

  function runInternalToTheory() {
    const value = Number(internalInput.trim());

    if (!Number.isInteger(value)) {
      setInternalOutput("Unable to parse expression.");
      return;
    }

    setInternalOutput(intervalName(value));
    setTheoryInput(intervalName(value));
  }

  return (
    <main className="app-shell">
      <section className="calculator-card">
          <p className="eyebrow">NaadaLab · Algebraic Music</p>

          <h1>Try an algebra of notes and intervals</h1>

          <p className="intro">
            In traditional music theory, notes and intervals already behave as if they
            belonged to a kind of pseudo-arithmetic.
          </p>

          <div className="landing-sections">
            <section>
              <h2>From musical theory to algebra</h2>
              <p>
                We subtract notes to obtain intervals, add intervals to notes, subtract
                intervals from notes, and add or subtract intervals from one another.
                These operations are not vague metaphors: music theory gives precise
                answers.
              </p>
              <p>
                For example, <code>IIImin + IIImin = Vdim</code>, while{" "}
                <code>IIImin + IIaug = IVaug</code>.
              </p>
              <p>
                This algebra is a mathematical translation of those familiar theoretical
                operations. It preserves enharmonic spellings and interval qualities,
                while reducing the underlying computation to integer addition and
                subtraction.
              </p>
            </section>

            <section>
              <h2>Valid operations</h2>
              <ul>
                <li><code>Note - Note → Interval</code></li>
                <li><code>Note + Interval → Note</code></li>
                <li><code>Note - Interval → Note</code></li>
                <li><code>Interval + Interval → Interval</code></li>
                <li><code>Interval - Interval → Interval</code></li>
              </ul>
            </section>

            <details>
              <summary>Paper abstract</summary>
              <p>
                In algorithmic music systems, especially those involving counterpoint and
                harmonic reasoning, it is essential to distinguish between enharmonically
                equivalent notes and isometric intervals. At the same time, efficient
                computation requires simple algebraic operations and access to musically
                meaningful equivalence classes.
              </p>
              <p>
                This paper introduces a unified algebraic representation of notes and
                intervals based on a cyclic integer domain. The proposed model preserves
                enharmonic distinctions while reducing all operations to integer addition
                and subtraction. The construction is derived from a fundamental assumption
                relating chromatic alteration and octave equivalence.
              </p>
            </details>

            <details>
              <summary>Properties</summary>
              <ul>
                <li>closure under the meaningful addition and subtraction operations;</li>
                <li>preservation of enharmonic distinctions;</li>
                <li>preservation of interval degree and quality;</li>
                <li>direct access to diatonic and chromatic equivalence classes;</li>
                <li>representation of opposite interval directions through additive inverse;</li>
                <li>computational simplicity through integer arithmetic.</li>
              </ul>
            </details>

            <details>
              <summary>A note about interval direction</summary>
              <p>
                In this representation, ascending intervals are not necessarily represented
                by positive integers, and descending intervals are not necessarily
                represented by negative integers.
              </p>
              <p>
                However, if <code>x</code> represents an ascending interval, then{" "}
                <code>-x</code> represents the same interval in the opposite direction.
                The two intervals have the same identity, but opposite direction.
              </p>
            </details>

            <section>
              <h2>Input notation</h2>
              <p>
                Notes use spellings such as <code>C4</code>, <code>C#4</code>,{" "}
                <code>Gbb2</code>. Intervals use Roman numerals and qualities, such as{" "}
                <code>IIImaj</code>, <code>IIImin</code>, <code>Vperf</code>,{" "}
                <code>IVaug2</code>, or <code>Vdim3</code>.
              </p>
              <p>
                The suffix <code>aug</code> and <code>dim</code> can be followed by a number
                to indicate multiple augmentations or diminutions. For example,{" "}
                <code>IVaug2</code> is a doubly augmented fourth, and{" "}
                <code>Vdim3</code> is a triply diminished fifth.
              </p>
              <p>
                While traditional music theory rarely goes beyond double augmentation or
                diminution, this algebra operates in a space that allows larger numbers of
                alterations. The notation simply extends the standard convention.
              </p>
            </section>

            <section>
              <h2>Why TET projections are shown</h2>
              <p>
                The algebra itself is not a tuning system. After the symbolic result is
                computed, it can be projected into 12-TET, 19-TET, 31-TET, 43-TET,
                45-TET, 53-TET, or 55-TET. This is why the same algebraic object can have
                different step and cent values in different tunings.
              </p>
            </section>
          </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            runExpression();
          }}
        >
          <div className="expression-row">
            <div className="expression-field">
              <label htmlFor="expression">Expression</label>
              <input
                id="expression"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="D4# - G2bb"
                autoFocus
              />
            </div>

            <button type="submit" className="evaluate-button">
              Evaluate
            </button>

            <div className="result-field">
              <label>Result</label>
              <div className="result-inline">{output || "—"}</div>
            </div>
          </div>
        </form>

        {lastResult && (
          <div className="numeric-row">
            <div>
              <span>Left operand</span>
              <strong>{lastResult.left.value}</strong>
            </div>

            <div className="numeric-op">{lastResult.op}</div>

            <div>
              <span>Right operand</span>
              <strong>{lastResult.right.value}</strong>
            </div>

            <div className="numeric-op">=</div>

            <div>
              <span>Result</span>
              <strong>{lastResult.value}</strong>
            </div>
          </div>
        )}

        {lastResult && lastResult.kind === "note" && (
          <>
            <div className="midi-row">
              MIDI: {midiNote(lastResult.value)}
            </div>
            <div className="tet-table">
              <div className="tet-header">System</div>
              <div className="tet-header">Position</div>
              <div className="tet-header">Step</div>
              <div className="tet-header">Hz</div>

              {[12, 19, 31, 43, 45, 53, 55].map((tet) => (
                <Fragment key={tet}>
                  <div>{tet}-TET</div>
                  <div>{formatNoteInTET(lastResult.value, tet)}</div>
                  <div>{stepClassInTET(lastResult.value, tet)}</div>
                  <div>{noteFrequencyHz(lastResult.value, tet).toFixed(2)}</div>
                </Fragment>
              ))}
            </div>
          </>
        )}

        {lastResult && lastResult.kind === "interval" && (
          <div className="tet-table interval-table">
            <div className="tet-header">System</div>
            <div className="tet-header">Cents</div>
            <div className="tet-header">Step</div>

            {[12, 19, 31, 43, 45, 53, 55].map((tet) => (
              <Fragment key={tet}>
                <div>{tet}-TET</div>
                <div>{intervalCents(lastResult.value, tet).toFixed(2)}</div>
                <div>{stepClassInTET(lastResult.value, tet)}</div>
              </Fragment>
            ))}
          </div>
        )}

        <div className="landing-sections advanced-panels">
          <section>
            <h2>Theoretical interval → Internal value</h2>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                runTheoryToInternal();
              }}
            >
              <div className="expression-row">
                <div className="expression-field">
                  <label htmlFor="theory-input">Theoretical interval</label>
                  <input
                    id="theory-input"
                    value={theoryInput}
                    onChange={(event) => setTheoryInput(event.target.value)}
                    placeholder="IVaug2"
                  />
                </div>

                <button type="submit" className="evaluate-button">
                  Encode
                </button>

                <div className="result-field">
                  <label>Internal</label>
                  <div className="result-inline">{theoryOutput || "—"}</div>
                </div>
              </div>
            </form>
          </section>

          <section>
            <h2>Internal value → Theoretical interval</h2>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                runInternalToTheory();
              }}
            >
              <div className="expression-row">
                <div className="expression-field">
                  <label htmlFor="internal-input">Internal value</label>
                  <input
                    id="internal-input"
                    value={internalInput}
                    onChange={(event) => setInternalInput(event.target.value)}
                    placeholder="137"
                  />
                </div>

                <button type="submit" className="evaluate-button">
                  Canonicalize
                </button>

                <div className="result-field">
                  <label>Theoretical</label>
                  <div className="result-inline">{internalOutput || "—"}</div>
                </div>
              </div>
            </form>
          </section>
        </div>

      </section>
    </main>
  );
}

export default App;